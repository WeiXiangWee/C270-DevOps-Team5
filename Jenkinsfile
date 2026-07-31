pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t c270-devops-team5 .'
            }
        }

        stage('Vulnerability Scan (Trivy)') {
            steps {
                sh 'chmod +x trivy-scan.sh'
                sh './trivy-scan.sh c270-devops-team5 HIGH,CRITICAL false'
            }
        }

        stage('Archive Security Report') {
            steps {
                archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
            }
        }



        stage('Verify Project') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'docker images'
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully!'
        }

        failure {
            echo 'CI Pipeline failed. Check the console output.'
        }
    }
}