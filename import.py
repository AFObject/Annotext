import re
import json

def process_annotated_text(text, title=""):
    # 正则匹配所有注释结构
    pattern = re.compile(r'【(.*?)】\s*（(.*?)）')
    matches = list(pattern.finditer(text))
    
    content_parts = []
    annotations = []
    prev_end = 0
    
    for match in matches:
        start = match.start()
        end = match.end()
        original_text = match.group(1)
        explanation = match.group(2)
        
        # 添加注释前的文本
        content_parts.append(text[prev_end:start])
        
        # 计算注释在清理后文本中的位置
        start_in_content = len(''.join(content_parts))
        content_parts.append(original_text)
        end_in_content = start_in_content + len(original_text)
        
        # 记录注释信息（类型字段留空）
        annotations.append({
            "text": original_text,
            "explanation": explanation,
            "type": "",
            "start": start_in_content,
            "end": end_in_content
        })
        
        prev_end = end
    
    # 添加最后一段文本
    content_parts.append(text[prev_end:])
    clean_content = ''.join(content_parts)
    
    return {
        "title": title,
        "content": clean_content,
        "annotations": annotations
    }

# 示例使用
input_text = """【《传》】（《论语》）曰：“其身正，不令而行；其身不正，【虽】（即使）令不从。”其李将军之谓也。余睹李将军【恂恂】（忠厚老实）如【鄙人】（乡下人），口不能【道辞】（能说会道）。及死之日，天下【知】（熟识）与不知，皆为尽哀。彼其忠实心【诚】（确实）【信于士大夫】（被士大夫们信赖）也。谚曰"桃李不言，下自成【蹊】（小路）"。此言虽小，可以【喻】（比喻，表明△）大也。”"""

result = process_annotated_text(input_text, title="李将军列传")
print(json.dumps(result, ensure_ascii=False, indent=4))