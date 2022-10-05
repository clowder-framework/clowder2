import time

if __name__ == "__main__":
    with open('testfile.txt') as f:
        for i in range(0, 10):
            line = 'line number ' + str(i) + '\n'
            f.write(line)
    print('done')