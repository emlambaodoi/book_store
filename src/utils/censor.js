// File: src/utils/censor.js

// 1. Danh sách các từ khóa thô tục (Bạn có thể thêm bớt tùy ý)
const badWords = [
    "đm", "vcl", "vl", "địt", "lồn", "cặc", "chó đẻ", "điếm"
    // Thêm các biến thể viết không dấu hoặc teencode nếu cần: "dm", "dkm", "vkl"
];

// 2. Hàm xử lý: Tìm và thay thế từ bậy bằng dấu ***
const censorText = (text) => {
    if (!text) return text;
    
    let censoredText = text;

    badWords.forEach(word => {
        // Tạo biểu thức chính quy (Regex)
        // 'g': tìm kiếm toàn bộ chuỗi
        // 'i': không phân biệt chữ hoa/chữ thường (ĐM, đm, Đm đều bị bắt)
        // '\\b': (Word boundary) Đảm bảo chỉ bắt từ độc lập, không bắt nhầm từ ghép 
        // VD: cấm chữ "du", không bắt nhầm chữ "du lịch" (Tuy nhiên tiếng Việt đôi khi không cần \\b, bạn có thể bỏ đi nếu thấy bắt sót)
        
        const regex = new RegExp(word, "gi"); 
        
        // Tạo ra chuỗi dấu * có độ dài bằng với từ bị cấm (VD: 'vcl' -> '***')
        const stars = "*".repeat(word.length);
        
        // Thay thế
        censoredText = censoredText.replace(regex, stars);
    });

    return censoredText;
};

module.exports = { censorText };