pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    environment {

        // AWS EC2 connection details
        AWS_USER = "ubuntu"
        AWS_HOST = "52.62.248.86"
        SSH_KEY = "/var/jenkins_home/RP-Sports-Booking.pem"

        // Project folder inside EC2
        APP_FOLDER = "C270-DevOps-Team5"

        // GitHub repository
        REPOSITORY = "https://github.com/WeiXiangWee/C270-DevOps-Team5.git"
    }

    stages {

        // Checkout latest code from GitHub
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // Configure EC2 infrastructure using Ansible
        stage('Run Ansible Infrastructure Setup') {
            steps {
                sh '''
                cd ansible
                ansible-playbook playbook.yml
                '''
            }
        }

        // Install project dependencies
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        // Run automated tests
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        // Build Docker image inside Jenkins
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t c270-devops-team5 .'
            }
        }

        // Scan Docker image vulnerabilities using Trivy
        stage('Vulnerability Scan (Trivy)') {
            steps {
                sh 'chmod +x trivy-scan.sh'
                sh './trivy-scan.sh c270-devops-team5 HIGH,CRITICAL false'
            }
        }

        // Store Trivy report in Jenkins artifacts
        stage('Archive Security Report') {
            steps {
                archiveArtifacts artifacts: '**/trivy-report.txt', allowEmptyArchive: true
            }
        }

        // Verify Jenkins build environment
        stage('Verify Build') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'docker images'
            }
        }

        // Deploy latest application to AWS EC2
        stage('Deploy Application To AWS') {
            steps {
                sh '''
                echo "Deploying application on AWS EC2..."

                ssh -i ${SSH_KEY} \
                -o StrictHostKeyChecking=no \
                ${AWS_USER}@${AWS_HOST} "

                    cd ${APP_FOLDER}

                    git pull origin main || exit 1

                    docker compose down

                    docker compose up -d --build

                "
                '''
            }
        }

        // Check deployed containers on AWS EC2
        stage('Verify AWS Deployment') {
            steps {
                sh '''
                ssh -i ${SSH_KEY} \
                -o StrictHostKeyChecking=no \
                ${AWS_USER}@${AWS_HOST} "

                    cd ${APP_FOLDER}

                    docker compose ps

                "
                '''
            }
        }
    }

    // Pipeline result message
    post {
        success {
            echo 'CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'CI/CD Pipeline failed. Check console output.'
        }
    }
}