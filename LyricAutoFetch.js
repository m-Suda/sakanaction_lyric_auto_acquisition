const puppeteer = require('puppeteer');
const fs = require('fs');
let lyrics = [];

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    try {
        await page.goto('http://j-lyric.net/artist/a04d6c9/');
        // 曲名とそのリンクの一覧を取得
        console.log('曲名とリンクの一覧を取得');
        const titles = await page.$$eval('.ttl > a', es => es.map(e => e.innerHTML));
        const links = await page.$$('.ttl > a');

        // 曲ごとの歌詞を取得
        for (let i = 0; i < links.length; i++) {
            console.log(`${i + 1}曲目開始`);
            page.click(`#ly${i + 1} > .ttl > a`);
            await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
            const lyric = await page.$$eval('.lbdy > p#Lyric', lyric => lyric[0].innerText.replace(/\r?\n/g, ''));
            lyrics.push(
                {
                    title: titles[i],
                    lyric,
                    keyword: '',
                    url: ''
                });
            console.log(`${i + 1}曲目完了`);
            await page.goBack();
        }

        console.log('歌詞情報をjsonファイル化');
        fs.writeFileSync('./lyric-json/lyrics.json', JSON.stringify(lyrics));
        console.log('歌詞取得終了');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();