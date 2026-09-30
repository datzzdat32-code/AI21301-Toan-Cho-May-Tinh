"""
LAB 1 - BÀI 4: Nhân hai Ma trận (C = A x B)
Môn học: AI21301 - Toán cho học máy
"""

def matrix_multiply(A, B):
    """
    Thực hiện phép nhân hai ma trận A (m x n) và B (n x p).
    
    Parameters:
        A (list of list): Ma trận A kích thước m x n.
        B (list of list): Ma trận B kích thước n x p.
        
    Returns:
        C (list of list): Ma trận tích C kích thước m x p, hoặc None nếu không hợp lệ.
    """
    # Kiểm tra tính hợp lệ của ma trận đầu vào
    if not A or not A[0] or not B or not B[0]:
        print("Lỗi: Ma trận đầu vào rỗng.")
        return None
        
    m = len(A)
    n = len(A[0])
    n_B = len(B)
    p = len(B[0])
    
    # Kiểm tra điều kiện nhân ma trận: Số cột của A phải bằng số hàng của B
    if n != n_B:
        print(f"Lỗi kích thước: Số cột của A ({n}) không bằng số hàng của B ({n_B}).")
        return None
        
    # Khởi tạo ma trận C có m hàng, p cột với toàn giá trị 0
    C = [[0 for _ in range(p)] for _ in range(m)]
    
    # Đếm số phép nhân số học đã thực hiện
    multiplication_count = 0
    
    # 3 vòng lặp for lồng nhau
    for i in range(m):
        for j in range(p):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
                multiplication_count += 1
                
    print(f"Tổng số phép nhân số học đã thực hiện: {multiplication_count}")
    return C


# Chạy thử nghiệm với test case mẫu
if __name__ == "__main__":
    A = [
        [1, 2, 3],
        [4, 5, 6]
    ]  # Kích thước 2x3

    B = [
        [7, 8],
        [9, 1],
        [2, 3]
    ]  # Kích thước 3x2

    print("Ma trận A (2x3):")
    for row in A:
        print(row)
        
    print("\nMa trận B (3x2):")
    for row in B:
        print(row)
        
    print("\nKết quả phép nhân C = A x B:")
    C = matrix_multiply(A, B)
    if C is not None:
        for row in C:
            print(row)
            
