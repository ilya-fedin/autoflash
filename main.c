#include <stdlib.h>
#include <string.h>

int main(int argc, char** argv) {
	char* arg0 = "sh.exe main.sh";
	char* command = malloc(strlen(arg0) + 1);
	strcpy(command, arg0);
	int returncode = 0;

	if(argc > 1) {
		char* arguments = malloc(strlen(" \"") + 1);
		strcpy(arguments, " \"");
		arguments = realloc(arguments, strlen(arguments) + strlen(argv[1]) + 1);
		strcat(arguments, argv[1]);
		arguments = realloc(arguments, strlen(arguments) + strlen("\"") + 1);
		strcat(arguments, "\"");
		if(argc > 2) {
			for(int i = 2; i < argc; i++) {
				arguments = realloc(arguments, strlen(arguments) + strlen(" \"") + 1);
				strcat(arguments, " \"");
				arguments = realloc(arguments, strlen(arguments) + strlen(argv[i]) + 1);
				strcat(arguments, argv[i]);
				arguments = realloc(arguments, strlen(arguments) + strlen("\"") + 1);
				strcat(arguments, "\"");
			}
		}
		command = realloc(command, strlen(command) + strlen(" ") + 1);
		strcat(command, " ");
		command = realloc(command, strlen(command) + strlen(arguments) + 1);
		strcat(command, arguments);
		free(arguments);
	}

	returncode = system(command);

	free(command);

	return returncode;
} 