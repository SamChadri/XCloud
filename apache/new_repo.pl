#!/usr/bin/perl 


use ModPerl::Registry; 

my ($username, $passwd);
my $params= <STDIN>;
my (@param_pairs) = split('&', $params);

 
print("Content-type: text/html\n");
print("<html>\n<body>");
print("<div style=\"width: 100%; font-size: 40px; font-weight: bold; text-align: center;\">");
print("CGI Script Test Page \n");

foreach my $pair (@param_pairs){
	my ($parameter, $value) = split('=', $pair, 2);
	if($parameter eq "username"){
		$username = $value;
		print("username has been set to : $value\n");
	}

	if($parameter eq "passwd"){
		$passwd = $value;
	}
	#print("$parameter has value : $value \n");	

}
open STDERR, '>>', '/home/httpd/perl/log.txt'
	or die "Couldn't redirect STDERR: $!";

my $command = `/bin/bash /home/httpd/perl/create_repo.sh $username $passwd`;
#system("/");

#open(my $fh, '>', ' /proc/1/fd/1');
#print $fh $command;
#close $fh;


print("Bash script result : $command \n");

print("</div>");
print("</body>\n</html>");

