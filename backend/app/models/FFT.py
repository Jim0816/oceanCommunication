from scipy import signal
import numpy as np

def low_pass(data, critical_frequencies = 30):
    '''
    低通滤波

    Parameters
    ---

    data: numpy, 原始数据, 1 x 1024
    critical_frequencies: int, 截止频率, 默认30Hz
    
    Returns
    ---

    data: numpy, 低通滤波后数据, 1 x 1024
    '''
    b, a = signal.butter(5, 2 * critical_frequencies / 1024, "low")
    data = signal.lfilter(b, a, data)
    return data

def FFT(data, critical_frequencies = 30):
    '''
    FFT

    Parameters
    ---
    data: numpy, 原始数据, 1 x 1024
    critical_frequencies: int, 截止频率,默认30Hz

    Returns
    ---
    frequency: numpy, 频率list, 截取到critical_frequencies
    amplitude: numpy, 幅度list, 20log10(A)

    '''

    l = len(data)
    window = np.hanning(l)
    res = data * window # 加窗

    frequency_list = 1024 / 2 * np.linspace(0, 1, len(data) // 2 + 1) # 频率值
    cut_f = np.where(frequency_list > critical_frequencies)[0][0]
    frequency = frequency_list[:cut_f]

    res = low_pass(data, critical_frequencies) # 低通滤波
    res = np.fft.fft(res)[:cut_f] / l * 2 # FFT
    res = np.abs(res) # 幅度
    amplitude = 20 * np.log10(res) # dB
    return frequency, amplitude