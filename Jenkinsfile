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
                sh '''
                    npm ci
                '''
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
                sh '''
                    npm test -- --ci --coverage
                '''
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true
                    /* groovylint-disable-next-line LineLength */
                    args '--entrypoint="" -e HOME=/root -e XDG_CACHE_HOME=/root/.cache -v trivy_cache:/root/.cache/trivy'
                }
            }

            steps {
                sh '''
                    trivy fs \
                    --cache-dir /root/.cache/trivy \
                    --scanners vuln \
                    --severity HIGH,CRITICAL \
                    --format sarif \
                    --output trivy-results.sarif \
                    .
                '''
            }
        }

        stage('Publish Trivy Results') {
            steps {
                recordIssues(
                    enabledForFailure: true,
                    failOnError: true,
                    tools: [
                        sarif(
                            id: 'trivy',
                            name: 'Trivy Security',
                            pattern: 'trivy-results.sarif'
                        )
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
                    sh '''
                        sonar-scanner
                    '''
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

        always {
            archiveArtifacts(
                artifacts: 'trivy-results.sarif',
                allowEmptyArchive: true
            )
        }

        success {
            echo '✅ Build, Test, Trivy, SonarQube dan Quality Gate berhasil.'
        }

        failure {
            echo '❌ Pipeline gagal.'
        }
    }
}