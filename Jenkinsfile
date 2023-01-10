agentLabel = "mattermost-dev"
pipeline {
    agent any
    stages {
        stage('master') {
            when {
                expression {env.GIT_BRANCH == 'origin/master'}
            }
            steps {
                sh "cp './.env.qa' './.env'"
                 script {
                    agentLabel = "mattermost"
                }
            }
        }
        stage('develop') {
            when {
                expression {env.GIT_BRANCH == 'origin/develop'}
            }
            steps {
                sh "cp './.env.dev' './.env'"
            }
        }
        stage ('PREPARE ENV'){
            steps {
                dir("${workspace}") {
                    stash name: 'modifiedenv', includes: '.env'
                }
            }
        }
        stage ('BUILD') {
            agent { label agentLabel }
            steps {
                bitbucketStatusNotify ( buildState: 'INPROGRESS' )
                dir("${workspace}") {
                    unstash 'modifiedenv'
                }
                script {
                    try {
                        sh './run-server.sh'
                        bitbucketStatusNotify( buildState: 'SUCCESSFUL' )
                    } catch (Exception e) {
                        bitbucketStatusNotify( buildState: 'FAILED' )
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }
        stage('Sonarqube') {
            environment {
                scannerHome = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh "echo ${scannerHome}"
                    sh "${scannerHome}/bin/sonar-scanner"
                }
                timeout(time: 1, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
