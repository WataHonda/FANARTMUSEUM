document.addEventListener('DOMContentLoaded', () => {
    const galleryWrapper = document.getElementById('gallery-wrapper');
    const galleryContainer = document.getElementById('gallery');
    const artworkForm = document.getElementById('artworkForm');
    let artworks = []; // オリジナルの作品データ (最新のものが先頭)
    let scrollInterval = null;
    const scrollSpeed = 15; // 端でのスクロール速度
    const cloneCount = 3; // 前後に複製するアイテムの数（アイテム数に応じて調整）

    // 仮の作品データ (初期表示用)
    const initialArtworks = [
        { title: "作品 Alpha", artist: "作家 1", src: "https://via.placeholder.com/300x220.png?text=Alpha" },
        { title: "作品 Beta", artist: "作家 2", src: "https://via.placeholder.com/280x350.png?text=Beta" },
        { title: "作品 Gamma", artist: "作家 3", src: "https://via.placeholder.com/320x200.png?text=Gamma" },
        { title: "作品 Delta", artist: "作家 4", src: "https://via.placeholder.com/260x300.png?text=Delta" },
        { title: "作品 Epsilon", artist: "作家 5", src: "https://via.placeholder.com/310x250.png?text=Epsilon" }
    ];
    artworks = [...initialArtworks];
    renderArtworks();

    // 作品投稿フォームの処理
    artworkForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('artworkTitle').value;
        const artist = document.getElementById('artistName').value;
        const fileInput = document.getElementById('artworkFile');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newArtwork = {
                    title: title,
                    artist: artist,
                    src: e.target.result,
                    originalWidth: 0,
                    originalHeight: 0
                };
                const img = new Image();
                img.onload = () => {
                    newArtwork.originalWidth = img.width;
                    newArtwork.originalHeight = img.height;
                    artworks.unshift(newArtwork); // 最新を先頭に
                    renderArtworks();
                    artworkForm.reset();
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            alert('画像ファイルを選択してください。');
        }
    });

    // ギャラリーに作品を描画する関数 (循環スクロール対応)
    function renderArtworks() {
        galleryContainer.innerHTML = ''; // クリア
        if (artworks.length === 0) return;

        // 循環表示のためにアイテムを複製
        const itemsToRender = [];
        if (artworks.length > 0 && artworks.length <= cloneCount * 2) { // アイテム数が少ない場合
            for (let i = 0; i < (cloneCount * 2 +1) / artworks.length +1 ; i++){ //表示アイテム数を確保するため繰り返し
                 itemsToRender.push(...artworks);
            }
        } else { //十分なアイテム数がある場合は前後にcloneCount分複製
            const clonesEnd = artworks.slice(0, cloneCount); // 先頭からcloneCount個 (末尾に追加用)
            const clonesStart = artworks.slice(artworks.length - cloneCount); // 末尾からcloneCount個 (先頭に追加用)
            itemsToRender.push(...clonesStart, ...artworks, ...clonesEnd);
        }


        itemsToRender.forEach((artwork, index) => {
            const frame = document.createElement('div');
            frame.classList.add('artwork-frame');
            // オリジナルアイテムかクローンかを区別する属性 (必要に応じて)
            // frame.dataset.originalIndex = artworks.indexOf(artwork);
            // frame.dataset.renderIndex = index;


            const imgEl = document.createElement('img');
            imgEl.src = artwork.src;
            imgEl.alt = artwork.title;
            // 画像サイズに合わせたフレーム調整 (前回のCSSに依存、またはJSで詳細制御)
            // 例: imgEl.style.maxWidth = artwork.originalWidth ? `${artwork.originalWidth}px` : '300px';

            const info = document.createElement('div');
            info.classList.add('artwork-info');
            info.innerHTML = `<h3>${artwork.title}</h3><p>${artwork.artist}</p>`;

            frame.appendChild(imgEl);
            frame.appendChild(info);
            galleryContainer.appendChild(frame);

            // マウスオーバーで作品を中央にスクロール
            frame.addEventListener('mouseenter', () => {
                scrollToCenter(frame);
            });
        });
        // 初期位置調整 (無限スクロールのため)
        // 全アイテムの幅を計算 (概算)
        if (artworks.length > 0 && artworks.length > cloneCount) {
             // 最初の「本物」のアイテム群の開始位置にスクロール
            const firstOriginalItem = galleryContainer.children[cloneCount];
            if (firstOriginalItem) {
                const initialScroll = firstOriginalItem.offsetLeft - (galleryWrapper.offsetWidth / 2) + (firstOriginalItem.offsetWidth / 2);
                galleryWrapper.scrollLeft = initialScroll;
            }
        }
    }

    // 要素をコンテナの中央にスムーズにスクロールする関数
    function scrollToCenter(element) {
        if (!element) return;
        const galleryRect = galleryWrapper.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // 要素の中心がギャラリーの中心に来るように目標スクロール位置を計算
        const targetScrollLeft = galleryWrapper.scrollLeft + (elementRect.left - galleryRect.left) + (elementRect.width / 2) - (galleryRect.width / 2);

        galleryWrapper.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }


    // 無限スクロールのための位置調整 (簡略版)
    galleryWrapper.addEventListener('scroll', () => {
        if (artworks.length === 0 || artworks.length <= cloneCount) return;

        const scrollLeft = galleryWrapper.scrollLeft;
        const scrollWidth = galleryWrapper.scrollWidth;
        const clientWidth = galleryWrapper.clientWidth;

        // オリジナルコンテンツ部分の幅を概算
        let originalContentWidth = 0;
        for (let i = cloneCount; i < galleryContainer.children.length - cloneCount; i++) {
            if (galleryContainer.children[i]) {
                 originalContentWidth += galleryContainer.children[i].offsetWidth + parseInt(getComputedStyle(galleryContainer.children[i]).marginLeft) + parseInt(getComputedStyle(galleryContainer.children[i]).marginRight);
            }
        }
        if (originalContentWidth === 0 && galleryContainer.children.length > 0) { // 概算が難しい場合のフォールバック
            const sampleItemWidth = galleryContainer.children[0].offsetWidth + parseInt(getComputedStyle(galleryContainer.children[0]).marginLeft) + parseInt(getComputedStyle(galleryContainer.children[0]).marginRight);
            originalContentWidth = sampleItemWidth * artworks.length;
        }


        // 右端近くまでスクロールしたら、先頭のクローン群の終わり（＝オリジナルの先頭）にジャンプ
        // 左端近くまでスクロールしたら、末尾のクローン群の始まり（＝オリジナルの末尾）にジャンプ
        // この閾値とジャンプ先の計算は、アイテムのマージンや正確な幅の合計に基づいて慎重に行う必要があります。

        const triggerOffset = clientWidth * 0.5; // スクロール調整のトリガーとなるオフセット

        if(scrollLeft >= originalContentWidth + (galleryContainer.children[cloneCount]?.offsetLeft || 0) - triggerOffset && originalContentWidth > 0){
            // 右にスクロールしすぎた場合、左（オリジナルの開始位置付近）に戻す
            galleryWrapper.scrollLeft -= originalContentWidth;
        } else if (scrollLeft <= (galleryContainer.children[cloneCount]?.offsetLeft || 0) - triggerOffset && originalContentWidth > 0) {
            // 左にスクロールしすぎた場合、右（オリジナルの終了位置付近）に戻す
            galleryWrapper.scrollLeft += originalContentWidth;
        }
    });


    // ギャラリーの左右端でのホバースクロール機能
    const scrollTriggerLeft = document.createElement('div');
    scrollTriggerLeft.classList.add('scroll-trigger', 'left');
    galleryWrapper.appendChild(scrollTriggerLeft); // galleryWrapperに配置

    const scrollTriggerRight = document.createElement('div');
    scrollTriggerRight.classList.add('scroll-trigger', 'right');
    galleryWrapper.appendChild(scrollTriggerRight); // galleryWrapperに配置

    scrollTriggerLeft.addEventListener('mouseenter', () => {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            galleryWrapper.scrollLeft -= scrollSpeed;
        }, 20);
    });
    scrollTriggerRight.addEventListener('mouseenter', () => {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            galleryWrapper.scrollLeft += scrollSpeed;
        }, 20);
    });
    const stopScroll = () => clearInterval(scrollInterval);
    scrollTriggerLeft.addEventListener('mouseleave', stopScroll);
    scrollTriggerRight.addEventListener('mouseleave', stopScroll);
    galleryWrapper.addEventListener('mouseleave', () => { // wrapperから出た時も止める
         if (! (scrollTriggerLeft.matches(':hover') || scrollTriggerRight.matches(':hover'))) {
            stopScroll();
         }
    });


    // 初期作品の描画
    renderArtworks();

    // ウィンドウリサイズ時に再計算が必要な場合
    // window.addEventListener('resize', () => {
    //     renderArtworks(); // レイアウトが崩れる可能性があるため再描画
    //     // または、中央表示やスクロール位置の再調整のみ行う
    // });
});