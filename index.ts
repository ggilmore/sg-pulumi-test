import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { genCloudInit } from './cloud-init';
import { ami, instanceType, sourcegraphVersion, sshKeyName } from './config';

const vpc = new awsx.ec2.Vpc('sourcegraph-vpc', {
	subnets: [ { type: 'public' } ]
});

const rules = [ 80, 443, 22, 2633 ].map((p) => ({
	protocol: 'tcp',

	fromPort: p,
	toPort: p,

	cidrBlocks: [ '0.0.0.0/0' ]
}));

const securityGroup = new aws.ec2.SecurityGroup('sourcegraph-security-group', {
	egress: rules,
	ingress: rules,
	vpcId: vpc.id
});

const dataDevice = '/dev/sdf';
const configDevice = '/dev/sdg';

const server = new aws.ec2.Instance('sourcegraph-ec2-instance', {
	ami,
	instanceType,
	ebsBlockDevices: [
		{
			deviceName: dataDevice,
			volumeSize: 100,
			encrypted: true
		},
		{
			deviceName: configDevice,
			volumeSize: 1,
			encrypted: true
		}
	],
	keyName: sshKeyName,
	securityGroups: [ securityGroup.id ],
	subnetId: vpc.publicSubnetIds[0],

	userData: genCloudInit(sourcegraphVersion, dataDevice, configDevice)
});

exports.publicIP = server.publicIp;
exports.publicHostName = server.publicDns;
