pipeline {
<<<<<<< HEAD

=======
>>>>>>> 30e77ebdf96778948705cf998e55b98868150099
    agent any

    tools {
        nodejs 'Node22'
    }

<<<<<<< HEAD

    environment {

        AWS_USER = "ubuntu"
        AWS_HOST = "54.253.11.83"
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

                ssh -i ${SSH_KEY} \
                -o StrictHostKeyChecking=no \
                ${AWS_USER}@${AWS_HOST} "

                    cd ${APP_FOLDER}

                    git pull origin main

                    docker compose down

                    docker compose up -d

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

=======
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
>>>>>>> 30e77ebdf96778948705cf998e55b98868150099
}