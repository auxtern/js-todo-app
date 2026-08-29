pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }

            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }

            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }

            steps {
                sh 'npm test -- --ci --coverage'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace:ro" \
                        -v trivy_cache:/root/.cache/trivy \
                        aquasec/trivy:latest \
                        fs \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --format json \
                        --output /workspace/trivy-results.json \
                        /workspace
                '''
            }
        }

        stage('Publish Trivy Results') {
            steps {
                recordIssues(
                    tools: [
                        trivy(pattern: 'trivy-results.json')
                    ]
                )
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                    reuseNode true
                    args '--network ci-network'
                }
            }

            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build, Test, Trivy, SonarQube dan Quality Gate berhasil.'
        }

        failure {
            echo '❌ Pipeline gagal.'
        }
    }
}