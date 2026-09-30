"""
LAB 1 - BÀI 3: Tích Ma trận và Vector (y = W * x)
Môn học: AI21301 - Toán cho học máy
"""

def matrix_vector_multiply(W, x):
    """
    Thực hiện phép nhân ma trận trọng số W (kích thước m x n) với vector đầu vào x (kích thước n).
    
    Parameters:
        W (list of list): Ma trận trọng số m x n.
        x (list): Vector đầu vào n phần tử.
        
    Returns:
        y (list): Vector kết quả m phần tử, hoặc None nếu kích thước không hợp lệ.
    """
    if not W or not W[0]:
        print("Lỗi: Ma trận W rỗng.")
        return None
        
    m = len(W)
    n = len(W[0])
    
    # Ràng buộc: Số cột của W phải bằng số phần tử của x
    if n != len(x):
        print(f"Lỗi kích thước: Số cột của W ({n}) phải bằng số phần tử của x ({len(x)}).")
        return None
        
    y = []
    for i in range(m):
        dot_product = 0.0
        for j in range(n):
            dot_product += W[i][j] * x[j]
        # Làm tròn nhẹ để tránh sai số hiển thị số thực dư thừa nếu cần
        y.append(round(dot_product, 4))
        
    return y


# Chạy thử nghiệm với test case mẫu
if __name__ == "__main__":
    W = [
        [0.2, 0.5, -0.1],
        [0.8, -0.3, 0.4]
    ]
    x = [10, 2, 5]
    
    print(f"Ma trận W (2x3): {W}")
    print(f"Vector x (3): {x}")
    
    y = matrix_vector_multiply(W, x)
    print(f"Kết quả y = W * x: {y}")

