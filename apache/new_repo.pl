#!/usr/bin/perl 



use strict;
use ModPerl::Registry 

my $username;
my $passwd; 

sub handler{
	my  $r = shift;
	my $content = $r->header_in('Content Length');
	my (@pairs) = split(/[&;]/, $content);
	my $count = 0;
	foreach my $pair (@pairs) {
		my ($parameter, $value) = split('=', $pair, 2);
		if($parameter == 'username'){
			$username = $value
		}
		if($parameter == 'passwd'){
			$passwd = $value
		}
		print "$parameter has value: $value";
	}
	system("sh create_repo.sh $username $passwd");
	print "Executed create_repo bash script";
  	return OK;
}
