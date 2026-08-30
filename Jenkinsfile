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
                    set -e

                    echo "=== Installing Dependencies ==="

                    npm install

                    echo "=== Dependencies Installed ==="
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
                    set -e

                    echo "=== Running Tests ==="

                    npm test -- --ci --coverage

                    echo "=== Tests Passed ==="
                '''
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:0.74.0'
                    reuseNode true

                    args '''
                        --entrypoint=""
                        -e HOME=/tmp
                        -e XDG_CACHE_HOME=/var/trivy-cache
                        -v trivy_cache:/var/trivy-cache
                    '''
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Trivy Version ==="
                    trivy --version

                    echo "=== Trivy Cache ==="
                    mkdir -p /var/trivy-cache
                    ls -ld /var/trivy-cache

                    echo "=== Trivy Scan ==="

                    trivy fs \
                        --cache-dir /var/trivy-cache \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --format sarif \
                        --output trivy-results.sarif \
                        .

                    echo "=== Trivy Result ==="
                    ls -lh trivy-results.sarif
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
                        set -e

                        echo "=== SonarQube Analysis ==="

                        sonar-scanner

                        echo "=== SonarQube Analysis Completed ==="
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

        stage('Package Application') {
            agent {
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Creating Application Package ==="

                    apk add --no-cache zip

                    rm -f latest-app.zip

                    zip -r latest-app.zip . \
                        -x "node_modules/*" \
                        -x ".git/*" \
                        -x ".env" \
                        -x ".env.*" \
                        -x "coverage/*" \
                        -x "latest-app.zip" \
                        -x "trivy-results.sarif"

                    echo "=== Application Package Created ==="

                    ls -lh latest-app.zip

                    echo "=== Package Content ==="

                    unzip -l latest-app.zip
                '''
            }
        }

        stage('Publish Application') {
            steps {
                archiveArtifacts(
                    artifacts: 'latest-app.zip',
                    fingerprint: true,
                    allowEmptyArchive: false
                )
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
            echo '✅ Test, Trivy, SonarQube, Quality Gate dan Package berhasil.'
            echo '📦 Artifact: latest-app.zip'
        }

        failure {
            echo '❌ Pipeline gagal.'
        }
    }
}
