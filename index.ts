import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const size = 't2.micro';
const ami = 'ami-0ff8a91507f77f867';

const vpc = new awsx.ec2.Vpc('pulumi-test-vpc', {
	subnets: [ { type: 'public' } ]
});

const group = new awsx.ec2.SecurityGroup('webserver-security-group', {
	ingress: [
		{
			protocol: 'tcp',
			fromPort: 22,
			toPort: 22,
			cidrBlocks: [ '0.0.0.0/0' ]
		}
	],
	vpc: vpc
});

const server = new aws.ec2.Instance('webserver-www', {
	instanceType: size,
	securityGroups: [ group.id ],
	ami: ami,
	subnetId: vpc.publicSubnetIds[0]
});

exports.publicIP = server.publicIp;
exports.publicHostName = server.publicDns;
