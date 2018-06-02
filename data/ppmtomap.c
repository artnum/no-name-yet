#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define BUFFER_SIZE     1024

#define COLOR_LIMIT     0xEEEEEE
/* 1. 17E4B1
 * 2. 2FC962
 * 3. 47AE13
 * 4. 5F92C4
 * 5. 777775
 * 6. A740D7
 * 7. BF2588
 * 8. D70A39
 * 9. E27F7F
 */
enum PPM_TYPE {  P1 = 1, P2, P3, P4, P5, P6 };

struct ppm_head {
    int offset;
    int _inbody;
    enum PPM_TYPE type;
    unsigned int width;
    unsigned int height;
    unsigned int maxval;
    unsigned int body_start;
};

#define HEAD_PROGRESS   0
#define COUNT_TAGBUFF   1
#define IN_COMMENT      2
#define WIDTH_POS       3
#define COUNT_OUTBUFF   4

const double clRatio = 0.000000575;
unsigned char colorToLevel ( unsigned int color ) {
    return floor(((double)color * clRatio) + 0.5) + 48; 
}


int main( int argc, char ** argv) {
    FILE * fp = NULL, *fpw = NULL;
    unsigned char buffer[BUFFER_SIZE] = { '\0' };
    size_t r = 0;
    int i = 0;
    long int value = 0;
    char *ptr = NULL;
    struct ppm_head head;
    unsigned char tagbuffer[BUFFER_SIZE] = { '\0' };
    unsigned char outbuffer[BUFFER_SIZE] = { '\0' };
    /* 0: head progress, 1: tagbuffer count, 2: in comment, 3: width position, 4: outbuffer count */
    int statehead[] = {0, 0, 0, 0, -1, 0, 0 };
    unsigned int color = 0; 

    if(argc < 3) { exit(0); }

    
    printf("ARUGMENTS : ");
    for(i = 0; i < argc; i++) {
        printf("%d:%s ", i, argv[i]);
    }
    printf("\n");
    
    fp = fopen(argv[1], "r");
    if(fp == NULL) {
        exit(0);
    }

    fpw = fopen(argv[2], "w");
    if(fpw == NULL) {
        exit(0);
    }

    head._inbody = 0;
    head.offset = 0;
    do {
        r = fread((char *)buffer, sizeof(buffer[0]), BUFFER_SIZE, fp);
        for(i = 0; i < r; i++) {
            if(statehead[HEAD_PROGRESS] == 4) {
                if(statehead[COUNT_OUTBUFF] == -1) {
                    statehead[COUNT_OUTBUFF] = 0;
                }
                tagbuffer[statehead[COUNT_TAGBUFF]] = buffer[i];
                statehead[COUNT_TAGBUFF]++;
                if(head.maxval < 256) {
                    /* 1 byte per color */
                    if(statehead[COUNT_TAGBUFF] == 3) {
                        color = 0;
                        color |= tagbuffer[0]; color = color << 8; 
                        color |= tagbuffer[1]; color = color << 8; 
                        color |= tagbuffer[2];
                        if(color < COLOR_LIMIT) {
                            outbuffer[statehead[COUNT_OUTBUFF]] = colorToLevel(color);
                        } else {
                            outbuffer[statehead[COUNT_OUTBUFF]] = 'x';
                        }
                        statehead[COUNT_OUTBUFF]++;

                        statehead[COUNT_TAGBUFF] = 0;
                        statehead[WIDTH_POS]++;
                        if(statehead[WIDTH_POS] == head.width) {
                            statehead[WIDTH_POS] = 0;
                            outbuffer[statehead[COUNT_OUTBUFF]] = '\n';
                            statehead[COUNT_OUTBUFF]++;
                        }
                    }
                } else {
                    /* 2 byte per color */
                    if(statehead[COUNT_TAGBUFF] == 6) {
                        color = 0;
                        statehead[COUNT_TAGBUFF] = 0;
                    }
                }
                
                if(statehead[COUNT_OUTBUFF] == BUFFER_SIZE) {
                    fwrite(outbuffer, sizeof(outbuffer[0]), statehead[COUNT_OUTBUFF], fpw);
                    statehead[COUNT_OUTBUFF] = 0;
                }

                continue;
            }
            
            
            switch(buffer[i]) {
                case 32: /* Gimp produce ppm with space in comment */
                    if(statehead[IN_COMMENT]) {
                        continue;
                    }
                case 13: case 10: case 9:
                    if(statehead[IN_COMMENT]) { 
                        statehead[IN_COMMENT] = 0; 
                        statehead[COUNT_TAGBUFF] = 0;
                        statehead[WIDTH_POS] = 0;
                        break;
                    }
                    switch(statehead[HEAD_PROGRESS]) {
                        case 0:
                            /* Type */
                            if(strncmp((char *)tagbuffer, "P6", 2) != 0) {
                                printf("Not in P6 format\n");
                                exit(0);
                            }
                            head.type = P6;
                            statehead[HEAD_PROGRESS]++;
                            break;
                        case 1:
                        case 2:
                        case 3:
                            value = strtol((char *)tagbuffer, &ptr, 10);
                            if(*ptr != '\0') {
                                printf("Invalid value : %d \"%s\"\n", statehead[HEAD_PROGRESS], tagbuffer); 
                                exit(0);
                            }
                            if(statehead[HEAD_PROGRESS] == 1) {
                                head.width = value;
                            } else if(statehead[HEAD_PROGRESS] == 2) {
                                head.height = value;
                            } else {
                                head.maxval = value;
                                printf("HEAD OK : P6, %d x %d, %d\n", head.width, head.height, head.maxval);
                                fprintf(fpw, "const MAP = `\n");
                            }
                            statehead[HEAD_PROGRESS]++;
                            break;
                        case 4:
                            /* Body */
                            break;
                    }
                    statehead[COUNT_TAGBUFF] = 0;
                    break;
                case '#':
                    statehead[IN_COMMENT] = 1;
                    break;
                default:
                    if(statehead[HEAD_PROGRESS] < 4) {
                        if(statehead[IN_COMMENT]) {
                            continue; /* don't care about comment */
                        }
                        tagbuffer[statehead[COUNT_TAGBUFF]] = buffer[i];
                        if(statehead[COUNT_TAGBUFF] + 1 < BUFFER_SIZE) {
                            tagbuffer[statehead[COUNT_TAGBUFF] + 1] = '\0';
                        } else {
                            printf("Tag too long, aborting");
                            exit(0);
                        }
                        statehead[COUNT_TAGBUFF]++;
                    } else {
                        
                    }
                    break;
            } 
        }
    } while(r == BUFFER_SIZE);

    if(statehead[COUNT_OUTBUFF] > 0) {
        fwrite(outbuffer, sizeof(outbuffer[0]), statehead[COUNT_OUTBUFF], fpw);
    }

    fclose(fp);
    fprintf(fpw, "`");
    fclose(fpw);
    exit(0);
}
