pipeline {
    agent any
    stages {
        stage ('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage ('Git Checkout') {
            steps {
                git url: 'https://github.com/vibhishh/World-Utility-Dashboard.git', branch: 'main'
            }
        }
        stage ('SonarQube Installation') {
            steps {
                script {
                    env.SCANNER_HOME=tool(
                        name: 'sonar-scanner',
                        type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    )
                    env.PATH="${env.SCANNER_HOME}/bin:${env.PATH}"
                    sh 'sonar-scanner --version'
                }
            }
        }
        stage ('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-scanner') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectName=worlddesk \
                        -Dsonar.projectKey=worlddesk
                    '''
                }
            }
        }
        stage ('Trivy FS Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --format table --output trivyyfs.txt .'
                archiveArtifacts artifacts: 'trivyyfs.txt', fingerprint: true
            }
        }
        stage(' Docker Image Build') {
            steps {
                sh 'docker build -t world-utility-dashboard:latest .'
            }
        }
        stage ('Trivy Image Scan') {
            steps {
                sh 'trivy image --severity HIGH,CRITICAL --format table --output trivy-img.txt world-utility-dashboard:latest'
                archiveArtifacts artifacts: 'trivy-img.txt', fingerprint: true
            }
        }
        stage ('Docker Login and Push to Registry') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId:'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker tag world-utility-dashboard:latest $DOCKER_USER/world-utility-dashboard:latest
                        docker push $DOCKER_USER/world-utility-dashboard:latest
                    '''
                }
            }
        }
    }
}
