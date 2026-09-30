"""
LAB 1 - BÀI 5: Lập trình Thuật toán Khử Gauss Đưa Ma trận về Dạng Bậc thang (Gaussian Elimination)
Môn học: AI21301 - Toán cho học máy
"""

def gaussian_elimination(aug_matrix):
    """
    Thuật toán Khử Gauss (Gaussian Elimination) đưa ma trận bổ sung [A|b]
    về dạng bậc thang (Row Echelon Form - REF).
    
    Sử dụng 2 kỹ thuật chính:
    1. Partial Pivoting (Hoán đổi dòng phần tử lớn nhất)
    2. Forward Elimination (Khử xuôi các phần tử phía dưới đường chéo)
    
    Parameters:
        aug_matrix (list of list): Ma trận bổ sung [A|b] kích thước m x n.
        
    Returns:
        ref_matrix (list of list): Ma trận dạng bậc thang với các giá trị được làm tròn 2 chữ số thập phân.
    """
    # Tạo bản sao độc lập của ma trận đầu vào để tránh sửa đổi dữ liệu gốc
    M = [row[:] for row in aug_matrix]
    m = len(M)
    n = len(M[0])
    
    # Số vị trí pivot tối đa cần xét
    num_pivots = min(m, n - 1)
    
    for k in range(num_pivots):
        # 1. Partial Pivoting: Tìm hàng i >= k có giá trị tuyệt đối |M[i][k]| lớn nhất
        max_row = k
        max_val = abs(M[k][k])
        for i in range(k + 1, m):
            if abs(M[i][k]) > max_val:
                max_val = abs(M[i][k])
                max_row = i
                
        # Nếu phần tử pivot quá nhỏ (~0), bỏ qua việc chọn pivot cột này
        if abs(M[max_row][k]) < 1e-12:
            continue
            
        # Hoán đổi hàng k với hàng max_row nếu cần
        if max_row != k:
            M[k], M[max_row] = M[max_row], M[k]
            
        # 2. Forward Elimination: Khử các phần tử ở cột k của các hàng i > k về 0
        for i in range(k + 1, m):
            factor = M[i][k] / M[k][k]
            # Trừ hàng i đi factor * (hàng k)
            for j in range(k, n):
                M[i][j] -= factor * M[k][j]
                
    # Trả về ma trận làm tròn 2 chữ số thập phân (xử lý -0.0 thành 0.0)
    ref_matrix = []
    for row in M:
        rounded_row = []
        for val in row:
            val_rounded = round(val, 2)
            if abs(val_rounded) == 0.0:
                val_rounded = 0.0
            rounded_row.append(val_rounded)
        ref_matrix.append(rounded_row)
        
    return ref_matrix


# ==============================================================================
# PHÂN TÍCH ĐỘ PHỨC TẠP THỜI GIAN (TIME COMPLEXITY ANALYSIS)
# ==============================================================================
# Đánh giá độ phức tạp thời gian O(...) của thuật toán Khử Gauss cho ma trận vuông n x n:
#
# 1. Với hệ phương trình n ẩn n phương trình, ma trận bổ sung [A|b] có kích thước n x (n + 1).
# 2. Vòng lặp chính k chạy từ 0 đến n - 1 (n bước).
# 3. Tại bước k:
#    - Partial Pivoting (Hoán đổi dòng): Duyệt (n - k) hàng để tìm max và hoán đổi -> O(n - k).
#    - Forward Elimination (Khử xuôi): 
#      + Có (n - 1 - k) hàng ở phía dưới cần khử.
#      + Với mỗi hàng, tính hệ số factor và trừ từng phần tử trong (n + 1 - k) cột.
#      + Số phép tính nhân/trừ ở bước k xấp xỉ (n - k) * (n - k) = (n - k)^2.
# 4. Tổng số phép toán số học thực hiện:
#    S = Sum_{k=0}^{n-1} (n - k)^2 = 1^2 + 2^2 + ... + n^2 = [n * (n + 1) * (2n + 1)] / 6
#    Khi n tiến ra vô cùng, S ~ (n^3) / 3.
#
# KẾT LUẬN:
# Độ phức tạp thời gian (Time Complexity) của Thuật toán Khử Gauss (Gaussian Elimination) là O(n^3).
# ==============================================================================


# Chạy thử nghiệm với test case mẫu
if __name__ == "__main__":
    # Ma trận bổ sung [A|b] của hệ phương trình:
    #  2*x +   y -   z =   8
    # -3*x -   y + 2*z = -11
    # -2*x +   y + 2*z =  -3
    augmented_matrix = [
        [ 2.0,  1.0, -1.0,   8.0],
        [-3.0, -1.0,  2.0, -11.0],
        [-2.0,  1.0,  2.0,  -3.0]
    ]
    
    print("Ma trận bổ sung ban đầu [A|b]:")
    for row in augmented_matrix:
        print(row)
        
    print("\nMa trận dạng bậc thang (Row Echelon Form):")
    ref = gaussian_elimination(augmented_matrix)
    for row in ref:
        print(row)
