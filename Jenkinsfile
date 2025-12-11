pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/Dboubaaycha/chatbot-recrutement-ia.git'
            }
        }
        stage('Build') {
            steps {
                echo 'Build successful!'
            }
        }
    }
}
