with open('src/components/AIChatbot/ChatPanel.tsx', 'r') as f:
    content = f.read()

old_str = "Em chưa có thông tin chính xác cho ý này. Anh/chị vui lòng chọn các gợi ý bên dưới hoặc nhấn nút 'Liên hệ trực tiếp' để trao đổi với Chương nhé!"
new_str = "Em chưa có thông tin chính xác cho ý này. Anh/ Chị vui lòng chọn các gợi ý bên dưới hoặc nhấn nút 'Liên hệ trực tiếp' để trao đổi với Chương nhé!"

content = content.replace(old_str, new_str)

with open('src/components/AIChatbot/ChatPanel.tsx', 'w') as f:
    f.write(content)
