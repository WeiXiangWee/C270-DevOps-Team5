pipeline {
    agent any

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

        stage('Verify Project') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
    }
}