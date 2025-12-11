pipeline {
    agent any
    
    environment {
        REPO_URL = 'https://github.com/Dboubaaycha/chatbot-recrutement-ia'
        BRANCH = 'main'
        IMAGE_NAME = 'chatbot-recrutement-ia'
        IMAGE_TAG = 'latest'
        CONTAINER_PORT = '80'
        HOST_PORT = '3000'
    }
    
    stages {
        stage('🔍 Clone Repository') {
            steps {
                script {
                    echo "Clonage du repository depuis GitHub..."
                    // Retry en cas d'échec réseau
                    retry(3) {
                        git branch: "${BRANCH}", url: "${REPO_URL}"
                    }
                }
            }
        }
        
        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo "Construction de l'image Docker..."
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('🧹 Nettoyage des conteneurs existants') {
            steps {
                script {
                    echo "Suppression des conteneurs existants..."
                    sh """
                        docker ps -a -q --filter 'name=${IMAGE_NAME}' | xargs -r docker rm -f || true
                    """
                }
            }
        }
        
        stage('🚀 Run Docker Container') {
            steps {
                script {
                    echo "Démarrage du conteneur Docker..."
                    sh """
                        docker run -d \
                        -p ${HOST_PORT}:${CONTAINER_PORT} \
                        --name ${IMAGE_NAME} \
                        --restart unless-stopped \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
        
        stage('✅ Vérification') {
            steps {
                script {
                    echo "Vérification que le conteneur est en cours d'exécution..."
                    sh "docker ps | grep ${IMAGE_NAME}"
                    echo "🎉 Application disponible sur http://localhost:${HOST_PORT}"
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline exécuté avec succès! Votre chatbot est maintenant disponible.'
            echo "🌐 Accédez à l'application sur : http://localhost:${HOST_PORT}"
        }
        failure {
            echo '❌ Le pipeline a échoué. Vérifiez les logs ci-dessus.'
        }
        always {
            echo '🧹 Nettoyage des images Docker inutilisées...'
            sh 'docker image prune -f || true'
        }
    }
}
