from pathlib import Path
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]
folder=root/'out/check/final'
paths=sorted(folder.glob('seam-S*.jpg'))
for offset in range(0,len(paths),8):
    batch=paths[offset:offset+8]
    cv=Image.new('RGB',(1280,len(batch)*210),'#eee7da')
    draw=ImageDraw.Draw(cv)
    for row,path in enumerate(batch):
        draw.text((8,row*210+3),path.stem,fill='#494649')
        with Image.open(path) as frame:
            cv.paste(frame,(0,row*210+26))
    cv.save(folder/f'seams-overview-{offset//8+1}.jpg',quality=94)
print(f'{len(paths)} seams -> {(len(paths)+7)//8} overview sheets')
