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
		char* arguments = malloc(strlen(arg_open) + strlen(argv[1]) + strlen(arg_close) + 1);
		sprintf(arguments, "%s%s%s", arg_open, argv[1], arg_close);
		if(argc > 2) {
			for(int i = 2; i < argc; i++) {
				arguments = realloc(arguments, strlen(arguments) + strlen(arg_open) + strlen(argv[i]) + strlen(arg_close) + 1);
				sprintf(arguments, "%s%s%s%s", arguments, arg_open, argv[i], arg_close);
			}
		}
		command = realloc(command, strlen(command) + strlen(" ") + strlen(arguments) + 1);
		sprintf(command, "%s %s", command, arguments);
		free(arguments);
	}

	SetCurrentDirectory(dirname(argv[0]));

	returncode = system(command);

	free(command);

	return returncode;
} 