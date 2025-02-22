import re
import json
import pyperclip

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
            "type": "yellow",
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
input_text = """公讳鼎，字实甫，自为童子时即以言动【自持】（自我克制），【趋】（快走）立多【中】（符合）礼。早岁善【属】（撰写）文，补邑诸生。坚意嗜读，【贯综今古】（融合贯通，综合古今），而【范】（做榜样）诸【先型】（带头先做），常【倾】（超过）其【伦】（辈，类）辈。

癸丑，成进士，为晋宁司理。【居】（担任）官廉正，吏【惮】（畏惧、害怕）其守，一切馈遗不敢入。【治狱】（=审理案件）多平反，即疑案【滞】（积压的）【讼】（案件），一讯【辄】（就）得其情。【老胥】（古代官府中的小吏）【巨猾】（指特别狡猾的人）皆【咋舌】（咬着舌头，形容因吃惊、害怕等而说不出话来）退，【罔】（不）敢【鬻法】（出卖官职爵位，徇私枉法）以【上下其间】（钻空子）。时有巡盐使者送犯拘罪，公讯无实，【辄】（就）释之。其公方不【阿】（=偏袒，迎合）【类】（像）如此。

【典试】（主持考试之事）山东，【持鉴】（持镜，比喻明察）朗察，所得皆知名士。【方】（正）在闱中，薛韩城时为莱郡司理，手一卷【力】（极力）荐之。公视其文【疵谬】（瑕疵错误）不可【入毂】（合乎程式和标准），驳至【再】（两次），乃与同事者搜阅，得一卷，共为【击节】（打拍子，形容十分赞赏）。及发【牍】（古代写字用的木片），为郝君名晋者，实【宿学】（学识渊博，修养有素的学者）寒士，既复捷去。公方以得人为慰。

【以】（凭借）左布政使调巡嘉湖，湖地【剧】（非常）难治，又多势家豪仆，飞舸肆掠，【略】（全）无所忌。公一日过乌镇，见【拥噪】（簇拥吵闹）千人，号泣震远迩。询之，曰：“朱家奴掠人也。”立捕两奴，及舟械至，奴犹称相国从者，意不下。公弗【顾】（顾忌），益尽法惩之，民【距跃】（欢欣之极）称快。自是豪强【屏息】（收敛行迹），终公之任，无敢暴掠【为非】（做种种坏事）。

公【孝友出于至性】（孝顺友爱处于纯粹的天性），廉于其身，而处人唯恐不【厚】（宽厚）。与人相接，无贫富长幼皆【整】（整肃，使…端庄/方）容礼之，或人有非理之请，虽亲厚必直辞拒之，不【妄】（随意）【徇】（屈从）也。其在任时，戚属间有所欲言，公相对【庄语】（严正的话语），多意【沮】（沮丧）而【寝】（停止）。居家【垂】（将近）二十年，【敦】（敦睦）【伦】（人伦）【赈】（救济）乏，【居德】（安居其德，修养道德）【正俗】（匡正风俗），不出户庭而系天下之望，人以比之范文正云。"""

a = input_text.split('\n')
res_text = ''
for i in a:
    if i.strip() != '':
        res_text += ('<p>' + i.strip() + '</p>')

result = process_annotated_text(res_text, title="周鼎传")
pyperclip.copy(json.dumps(result, ensure_ascii=False, indent=4))