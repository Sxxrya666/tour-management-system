pipeline { 
    agent any 

    stages { 
        stage('Init') { 
            steps { 
                echo 'checking shit'
                sh 'bun -v'
            }
        }
        stage('Testing') {
            steps {
                echo "testing this shit"
                sh 'bun test'
            }
        }

        stage('Building') {
            steps {
                echo "building it out nigga..."
            }
        }
    }
}