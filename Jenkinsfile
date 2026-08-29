pipeline {
    agent {
        docker {
            image 'node:22-alpine'
        }
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --ci --coverage'
            }
        }

        stage('Archive Test Results') {
            steps {
                archiveArtifacts(
                    artifacts: 'coverage/**',
                    allowEmptyArchive: true
                )
            }
        }
    }

    post {
        always {
            echo "Build result: ${currentBuild.currentResult}"
        }

        success {
            echo '✅ Semua test berhasil.'
        }

        failure {
            echo '❌ Build atau test gagal.'
        }
    }
}