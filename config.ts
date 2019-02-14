import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

// Amazon Linux 2 AMI in us-west-2
export const ami = config.get('ami') || 'ami-032509850cf9ee54e';

export const instanceType: aws.ec2.InstanceType = <aws.ec2.InstanceType>config.get('instanceType') || 't2.large';

export const sourcegraphVersion = config.get('sourcegraphVersion') || 'insiders';

export const sshKeyName = config.get('sshKeyName');
