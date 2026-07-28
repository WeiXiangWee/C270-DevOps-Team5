pipeline {

    agent any

    tools {
        nodejs 'Node22'
    }


    environment {

        AWS_USER = "ubuntu"
        AWS_HOST = "13.211.42.247"
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

                    if [ ! -d ${APP_FOLDER} ]; then

                        git clone ${REPOSITORY}

                    fi


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

}