pipeline {
    agent any
    
    environment {
        REPO_URL = 'https://github.com/Dboubaaycha/chatbot-recrutement-ia'
        BRANCH = 'main'
        IMAGE_NAME = 'chatbot-recrutement-ia-dev'
        IMAGE_TAG = 'latest'
        HOST_PORT = '3000'
    }
    
    stages {
        
        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo "Construction de l'image Docker..."
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('🧹 Nettoyage') {
            steps {
                script {
                    sh """
                        docker ps -a -q --filter 'name=${IMAGE_NAME}' | xargs -r docker rm -f || true
                    """
                }
            }
        }
        
        stage('🚀 Run Docker Container') {
            steps {
                script {
                    sh """
                        docker run -d \
                        -p ${HOST_PORT}:3000 \
                        --name ${IMAGE_NAME} \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Chatbot disponible sur : http://localhost:${HOST_PORT}"
        }
        failure {
            echo '❌ Pipeline échoué.'
        }
    }
}
