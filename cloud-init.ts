function genCloudInit(version: string, dataDisk: string, configDisk: string): string {
	return `#cloud-config
repo_update: true
repo_upgrade: all

# Configure disks
disk_setup:
    ${dataDisk}:
        table_type: 'mbr'
        layout: 'auto'
        overwrite: false
    ${configDisk}:
        table_type: 'mbr'
        layout: 'auto'
        overwrite: false

fs_setup:
- device: ${dataDisk}
  filesystem: 'ext4'
  label: ${dataDisk}
  overwrite: false
- device: ${configDisk}
  filesystem: 'ext4'
  label: ${configDisk}
  overwrite: false

mounts:
- [ ${dataDisk}, /home/ec2-user/.sourcegraph/data ]
- [ ${configDisk}, /home/ec2-user/.sourcegraph/config ]

runcmd:
# Create the directory structure for Sourcegraph data
- mkdir -p /home/ec2-user/.sourcegraph/config
- mkdir -p /home/ec2-user/.sourcegraph/data

# Install, configure, and enable Docker
- yum update -y
- amazon-linux-extras install docker
- systemctl enable --now --no-block docker 
- sed -i -e 's/1024/10240/g' /etc/sysconfig/docker
- sed -i -e 's/4096/40960/g' /etc/sysconfig/docker
- usermod -a -G docker ec2-user

# Install and run Sourcegraph. Restart the container upon subsequent reboots
- [ sh, -c, 'docker run -d --publish 80:7080 --publish 443:7443 --publish 2633:2633 --restart unless-stopped --volume /home/ec2-user/.sourcegraph/config:/etc/sourcegraph --volume /home/ec2-user/.sourcegraph/data:/var/opt/sourcegraph sourcegraph/server:${version}' ]
`;
}

export { genCloudInit };
