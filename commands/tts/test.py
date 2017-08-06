from gtts import gTTS
import sys
import os

countries = ['af','sq','ar','hy','bn','ca','zh','zh-cn','zh-tw','zh-yue','hr','cs','da','nl','en',
             'en-au','en-uk','en-us','eo','fi','fr','de','el','hi','hu','is','id','it','ja','km','ko',
             'la','lv','mk','no','pl','pt','ro','ru','sr','si','sk','es','es-es','es-us','sw','sv','ta'
                ,'th','tr','uk','vi','cy']



terms = sys.argv[1]

dads = terms.split()



country = dads[0]
dads.pop(0)
moredads = " ".join(dads)



f = open('workfile', 'r')
word = f.readline()

print(dads)
dad = True
for ele in countries:
        print(ele)
        if ele == country:
                tts = gTTS(text=word, lang=country, slow=False)
                tts.save("hello.mp3")
                os.system("ffmpeg -i hello.mp3 hello.opus")
                print(ele)
                dad = False
                break

if dad is True:
    tts = gTTS(text=terms, lang='en-au', slow=False)
    tts.save("hello.mp3")
    os.system("ffmpeg -i hello.mp3 hello.opus")
