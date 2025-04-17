# test.py
def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5)+1):
        if n % i == 0:
            return False
    return True

if __name__ == "__main__":
    import sys
    input_data = sys.stdin.read().strip()
    n = int(input_data)
    print(is_prime(n))
