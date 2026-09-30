"""
LAB 1 - BÀI 2: Tính Chuẩn Vector L1 và L2 (Vector Norms)
Môn học: AI21301 - Toán cho học máy
"""

def norm_l1(v):
    """
    Tính chuẩn L1 (Manhattan Norm): ||v||_1 = sum(|v_i|)
    
    Parameters:
        v (list): Vector các phần tử số.
        
    Returns:
        float/int: Chuẩn L1 của vector v.
    """
    total = 0
    for x in v:
        total += abs(x)
    return total

def norm_l2(v):
    """
    Tính chuẩn L2 (Euclidean Norm): ||v||_2 = sqrt(sum(v_i^2))
    
    Parameters:
        v (list): Vector các phần tử số.
        
    Returns:
        float: Chuẩn L2 của vector v.
    """
    sum_sq = 0
    for x in v:
        sum_sq += x ** 2
    return sum_sq ** 0.5


# Chạy thử nghiệm với test case mẫu
if __name__ == "__main__":
    error_vector = [3, -4]
    
    l1_result = norm_l1(error_vector)
    l2_result = norm_l2(error_vector)
    
    print(f"Vector sai số: {error_vector}")
    print(f"L1 Norm: {l1_result}") 
    print(f"L2 Norm: {l2_result}")
