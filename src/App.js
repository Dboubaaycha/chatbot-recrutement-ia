import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Settings, Download, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

const RecruitmentChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant de recrutement intelligent propulsé par Groq. Je peux vous aider avec les compétences requises, des questions d\'interview, et bien plus. Comment puis-je vous aider ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompt = `Tu es un assistant expert en recrutement. Tu aides les recruteurs et candidats avec :
- Les compétences nécessaires pour différents postes tech (développeur frontend, backend, fullstack, data scientist, UI/UX designer, etc.)
- Des questions d'interview pertinentes et techniques
- L'évaluation de candidats
- Des conseils sur le processus de recrutement
- Des exemples concrets et pratiques

Sois précis, professionnel et donne toujours des exemples concrets. Réponds en français de manière structurée et claire.`;

  const callGroqAPI = async (userMessage) => {
    try {
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...conversationHistory,
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erreur API Groq:', error);
      return `❌ Erreur : ${error.message}. Vérifiez votre clé API dans les paramètres (⚙️).`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      alert('⚠️ Veuillez configurer votre clé API Groq dans les paramètres (icône ⚙️)');
      setShowSettings(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await callGroqAPI(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Désolé, une erreur s\'est produite. Vérifiez votre clé API Groq.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 📄 EXPORT EN PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // En-tête
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('CONVERSATION DE RECRUTEMENT', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, margin, yPosition);
      yPosition += 15;

      // Messages
      messages.forEach((msg) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        // Rôle
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        const role = msg.role === 'assistant' ? 'ASSISTANT IA' : 'VOUS';
        doc.text(role, margin, yPosition);
        yPosition += 7;

        // Contenu
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const content = msg.content.replace(/\*\*/g, ''); // Enlever le markdown
        const lines = doc.splitTextToSize(content, maxWidth);
        
        lines.forEach(line => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        yPosition += 8; // Espace entre les messages
      });

      // Télécharger le PDF
      doc.save(`conversation-recrutement-${Date.now()}.pdf`);
      alert('✅ Conversation exportée en PDF avec succès !');
      
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('❌ Erreur lors de l\'export PDF: ' + error.message);
    }
  };

  // 🗑️ RÉINITIALISER LA CONVERSATION
  const clearConversation = () => {
    if (window.confirm('Voulez-vous vraiment effacer toute la conversation ?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Bonjour ! Je suis votre assistant de recrutement intelligent. Comment puis-je vous aider ?'
        }
      ]);
      alert('✅ Conversation réinitialisée !');
    }
  };

  const renderMessage = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="font-semibold mt-3 mb-1 text-gray-900">{line.slice(2, -2)}</div>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={i} className="my-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </div>
        );
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} className="ml-2 my-0.5">{line}</div>;
      }
      if (line.match(/^\d+\./)) {
        return <div key={i} className="ml-2 my-0.5">{line}</div>;
      }
      if (line.startsWith('#')) {
        return <div key={i} className="font-bold text-lg mt-3 mb-2">{line.replace(/^#+\s*/, '')}</div>;
      }
      return <div key={i} className="my-0.5">{line || '\u00A0'}</div>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Assistant de Recrutement IA</h1>
              <p className="text-xs text-gray-500">Propulsé par Groq (100% Gratuit)</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exporter en PDF"
              disabled={messages.length <= 1}
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={clearConversation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Réinitialiser la conversation"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Paramètres API"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-200 bg-purple-50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">🔑 Configuration API Groq (Gratuit)</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Collez votre clé API Groq (gsk_...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                Sauvegarder
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>📌 <strong>Comment obtenir votre clé :</strong></p>
              <p>1. Allez sur <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">console.groq.com</a></p>
              <p>2. Créez un compte gratuit (pas de carte bancaire)</p>
              <p>3. Cliquez sur "API Keys" → "Create API Key"</p>
              <p>4. Copiez la clé et collez-la ci-dessus</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="text-sm font-medium text-gray-900">
                  {msg.role === 'assistant' ? 'Assistant IA' : 'Vous'}
                </div>
                <div className="text-gray-800 leading-relaxed text-[15px]">
                  {renderMessage(msg.content)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium text-gray-900">Assistant IA</div>
                <div className="flex space-x-1 py-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur le recrutement..."
              rows="1"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              style={{ minHeight: '52px', maxHeight: '200px' }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 bg-purple-600 text-white p-2.5 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {apiKey ? '✅ API Groq configurée (Gratuit)' : '⚠️ Configurez votre clé API gratuite (cliquez sur ⚙️)'} • Propulsé par Groq AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentChatbot;