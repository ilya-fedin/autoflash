#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <libgen.h>
#include <windows.h>

int main(int argc, char** argv) {
	char* arg0 = "sh.exe main.sh";
	char* arg_open = " \"";
	char* arg_close = "\"";
	char* command = malloc(strlen(arg0) + 1);
	strcpy(command, arg0);
	int returncode = 0;

	if(argc > 1) {
		for(int i = 1; i < argc; i++) {
			command = realloc(command, strlen(command) + strlen(arg_open) + strlen(argv[i]) + strlen(arg_close) + 1);
			sprintf(command, "%s%s%s%s", command, arg_open, argv[i], arg_close);
		}
	}

	SetCurrentDirectory(dirname(argv[0]));

	returncode = system(command);

	free(command);

	return returncode;
} 