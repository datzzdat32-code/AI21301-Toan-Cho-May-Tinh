"""
LAB 1 - BÀI 1: Khởi tạo và Chuyển vị Ma trận (Transpose Matrix)
Môn học: AI21301 - Toán cho học máy
"""

def transpose_matrix(A):
    """
    Hàm tính ma trận chuyển vị A^T của ma trận A (kích thước m x n)
    bằng vòng lặp Python thuần.
    
    Parameters:
        A (list of list): Ma trận gốc kích thước m x n.
        
    Returns:
        A_T (list of list): Ma trận chuyển vị kích thước n x m.
    """
    rows = len(A)
    cols = len(A[0])
    
    # Bước 2: Khởi tạo ma trận kết quả A^T kích thước (cols x rows) với giá trị ban đầu là 0
    A_T = [[0 for _ in range(rows)] for _ in range(cols)]
    
    # Bước 3 & 4: Duyệt qua từng phần tử và hoán đổi chỉ số hàng, cột
    for i in range(rows):
        for j in range(cols):
            A_T[j][i] = A[i][j]
            
    # Bước 5: Trả về ma trận chuyển vị kết quả
    return A_T


# Chạy thử nghiệm với test case mẫu
if __name__ == "__main__":
    A = [
        [1, 2, 3],
        [4, 5, 6]
    ]
    
    print("Ma trận ban đầu A:")
    for row in A:
        print(row)
        
    print("\nMa trận chuyển vị A_T:")
    A_T = transpose_matrix(A)
    for row in A_T:
        print(row)
    
  