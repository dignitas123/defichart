## Create an EC2 instance

- First, create an EC2 instance on AWS. Choose an appropriate instance type based on your application's requirements. (Ubuntu preffered)

## Configure security groups

- Configure security groups to allow traffic to your EC2 instance. Open the required ports for HTTP, HTTPS, and SSH.
- Allow ssh only for your ip (MyIP) and set allow https and http traffic.

## Connect to the instance

- Connect to the instance using SSH. On a Linux or Mac system, open a terminal window and use the ssh command to connect to the instance.
- Open Terminal at folder with the .pem file from ec2 instance generated key pair
- Set permissions with sudo chmod 400 defichartsinstance.pem
- Connect to instance with ssh (see ## Connect to instance)
  (your .pem file, ec2-user even if you use ubuntu, the @ address is under EC2 > Instances > instanceId and then Public IPv4 DNS)

## installations on ec2 instance

- `sudo yum update`
- `sudo amazon-linux-extras install nginx1`
- `sudo yum install git npm`
- `sudo npm install yarn -g`

## install node

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
`. ~/.nvm/nvm.sh
nvm install 16 // (nvm install -lts not supported)
```

## setup nginx

- `sudo mkdir /etc/nginx/sites-available`
- `sudo mkdir /etc/nginx/sites-enabled`
- `sudo mkdir /var/www`
- `sudo mkdir /var/www/html`
- `cd /etc/nginx/sites-available`
- `sudo ln -s /etc/nginx/sites-available/deficharts /etc/nginx/sites-enabled/`
- `sudo nano /etc/nginx/sites-available/deficharts`:

```
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/deficharts/dist/spa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- `sudo systemctl start nginx`
- `sudo systemctl restart nginx`
- check Public IPv4 DNS with http. U should see nginx welcome screen
- `sudo cp -r /home/ec2-user/defichart/frontend/dist/spa/. /usr/share/nginx/html` to copy build

## connect github repo

- `ssh-keygen`
- `cat ~/.ssh/id_rsa.pub`
- copy the key
- under github > options > SSH and GPG Keys > New SSH Key add copied key (ssh-rsa AAAAB3NzaC1yc2EAA… until whitespace)
- git clone git@github.com:<username>/<repository>.git (git clone git@github.com:dignitas123/defichart.git)
- `cd defichart & yarn & yarn build`

## creating a github access token

1. Navigate to the "Settings" page for your account.
2. In the left sidebar, click on "Developer settings".
3. Click on "Personal access tokens".
4. Click on the "Generate new token" button.
5. Give your token a name that will help you identify its purpose. For example, "Deployment to EC2".
6. Under "Select scopes", click on the "repo" checkbox to give the token access to your repositories.
7. Scroll down to the bottom of the page and click on the "Generate token" button.
8. Your new access token will be displayed. Make sure to copy the token and store it in a secure location. Once you leave the page, you will not be able to access the token again.
   You can then use this token as a secret in your pipeline to authenticate with Github and deploy the dist folder to your EC2 instance.

- Read and write access to code and other repository data.
- Read and write access to issues, pull requests, and project boards.
- Read and write access to actions, packages, and repository secrets.

## create an IAM user

1. Log in to your AWS Management Console and navigate to the IAM service.
2. Click on "Users" in the left sidebar, then click on the "Add user" button.
3. Enter a name for the user, and select the "Programmatic access" checkbox to create an access key for the user.
4. Click on the "Next: Permissions" button.
5. Select the "Attach existing policies directly" option, then click on the "Create policy" button to create a new policy.
6. In the policy editor, select the "JSON" tab and paste in the following policy, replacing YOUR-INSTANCE-ID with the ID of your EC2 instance:
7. Click on the "Review policy" button, give the policy a name, and then click on the "Create policy" button.
8. In the "Add user" page, refresh the page to load the newly created policy, then select the policy you just created by clicking the checkbox next to its name.
9. Click on the "Next: Tags" button, and add any relevant tags to the user if necessary.
10. Click on the "Review" button, review the user's details, and then click on the "Create user" button.
11. On the final page, you will see the user's access key ID and secret access key. Make sure to download and securely store the access key, as you will not be able to retrieve the secret key again.
    You can now use the access key to authenticate with your EC2 instance and deploy your application.

## How to create a pipeline

1. In the AWS CodePipeline console, click on "Create pipeline" to create a new pipeline. In the "Source" stage, choose "GitHub" as the provider and follow the prompts to authenticate and select the repository and branch that you want to deploy.
2. In the "Build" stage, choose "AWS CodeBuild" as the provider. If you haven't already created a CodeBuild project, you can create a new one by clicking the "Create project" button.
3. In the CodeBuild project settings, you can choose the environment that your build will run in. For this case, you should choose the "Ubuntu" environment, since the tutorial assumed that the EC2 instance was running Ubuntu.
4. You'll also need to specify the build commands for your CodeBuild project. These commands should clone your repository, install any dependencies needed for your application, and deploy the dist folder to the EC2 instance using the scp command.

## upload a file to ec2 instance

```
sudo scp -i defichartsinstance.pem defichartsinstance.pem ec2-user@ec2-18-159-79-156.eu-central-1.compute.amazonaws.com:/home/ec2-user/
```

## Connect to instance

`ssh -i defichartsinstance.pem ec2-user@ec2-18-159-79-156.eu-central-1.compute.amazonaws.com`
