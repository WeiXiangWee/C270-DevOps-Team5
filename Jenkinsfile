pipeline {

    agent any

    tools {
        nodejs 'Node22'
    }


    environment {

        AWS_USER = "ubuntu"
        AWS_HOST = "3.27.125.149"
        SSH_KEY = "/var/jenkins_home/RP-Sports-Booking.pem"

        APP_FOLDER = "C270-DevOps-Team5"

        REPOSITORY = "https://github.com/WeiXiangWee/C270-DevOps-Team5.git"

    }


    stages {


        stage('Checkout Code') {

            steps {

                checkout scm

            }

        }



        stage('Run Ansible Infrastructure Setup') {

            steps {

                sh '''

                cd ansible

                ansible-playbook playbook.yml

                '''

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
                archiveArtifacts artifacts: '**/trivy-report.txt', allowEmptyArchive: true
            }
        }



        stage('Verify Build') {
            steps {

                sh 'node --version'

                sh 'npm --version'

                sh 'docker images'

            }

        }



        stage('Deploy Application To AWS') {

            steps {

                sh '''

                echo "Copying latest code to AWS EC2..."

                scp -i ${SSH_KEY} \
                -o StrictHostKeyChecking=no \
                -r ./* \
                ${AWS_USER}@${AWS_HOST}:~/${APP_FOLDER}/


                echo "Deploying application on AWS EC2..."

                ssh -i ${SSH_KEY} \
                -o StrictHostKeyChecking=no \
                ${AWS_USER}@${AWS_HOST} "

                    cd ${APP_FOLDER}

                    docker compose down

                    docker compose up -d --build

                "

                '''

            }

        }



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



    post {


        success {

            echo 'CI/CD Pipeline completed successfully!'

        }


        failure {

            echo 'CI/CD Pipeline failed. Check console output.'

        }


    }

}