# Gulp-start
Сборка для быстрого старта на основе Gulp (pug, scss, jquery, gulp)

### Для работы сборки у вас должны быть установлены:
1) git
2) node
3) npm
4) gulp


### Запуск сборки:

1. `git clone https://github.com/mtvphnx/gulp-start.git`
2. `cd gulp-start`
3. `rm -rf .git`
4. `npm i`
5. `gulp start`

### Команды:

| Имя | Описание |
|---------------|----------------------|
| `gulp start` | запуск сборки и сервера с livereload |
| `gulp build` | запуск сборки без сервера |
| `gulp templates` | перевод pug в html |
| `gulp styles` | перевод scss в css |
| `gulp scripts` | перевод скриптов в ES5, конкатинация и минификация |
| `gulp libs` | конкатинация и минификация js-библиотек |
| `gulp svg` | конкатинация svg в спрайт, оптимизация спрайта |
| `gulp pic` | оптимизация изображений |

### Миксины, функции, переменные scss:

1. Миксин для генерации font-face
```css
@mixin font-face($name, $path, $weight: null, $style: null, $exts: eot woff2 woff ttf svg) {
    $src: null;

    $extmods: (
        eot: "?",
        svg: "#" + str-replace($name, " ", "_")
    );

    $formats: (
        otf: "opentype",
        ttf: "truetype"
    );

    @each $ext in $exts {
        $extmod: if(map-has-key($extmods, $ext), $ext + map-get($extmods, $ext), $ext);
        $format: if(map-has-key($formats, $ext), map-get($formats, $ext), $ext);
        $src: append($src, url(quote($path + "." + $extmod)) format(quote($format)), comma);
    }

    @font-face {
        font-family: quote($name);
        font-style: $style;
        font-weight: $weight;
        src: $src;
    }
}
```
Передаем в миксин имя шрифта, путь до файлов, жирность и начертание, а также расширения файлов, которые мы будем использовать (перечисляем без запятых, к примеру `$exts: woff woff2 otf ttf`).
```css
@include font-face(<имя>, './../fonts/<имя>', <жирность>, <начертание>, $exts: <расширения>);
```

2. Миксин для использования шрифтов
```css
@mixin имя($style) {
  font-family: <имя>, <альтернатива>, <семейство>;

  @if $style == <стиль> {
    font-weight: <жирность>;
    font-style: <начертание>;
  }
}
```
Передаем в миксин имя заранее созданного в файле _fonts.scss шрифта, и параметр стиля (если у шрифта есть разные начертания).
```css
@mixin <имя>(<стиль>);
```

3. Функция перевода px в rem
```css
@function rem($pixels) {
  @return #{$pixels / 16px}rem;
}
```
Передаем в эту функцию количество пикселей, к примеру так:
```css
font-size: rem(14px);
```

4. Переменные брекпоинтов
```css
$desktops: rem(1200px);
$laptops: rem(992px);
$tablets: rem(768px);
$phones: rem(480px);
```

5. Миксин для адаптации
```css
@mixin <имя> {
  @media screen and (max-width: <размер>){
    @content;
  }
}
```
Данный миксин вызывается прямо в селекторе, его можно использовать вместе с переменными брекпоинтов. К примеру, если мы хотим изменить цвет блока .block на красный, на мобильных телефонах с разрешением меньше 480px, создаем миксин для мобильных устройств:
```css
@mixin phone {
  @media screen and (max-width: $phones){
    @content;
  }
}
```
а затем вызываем его:
```css
.block {
    @include phone {
        background-color: red;
    }
}
```

### Плагины в сборке:

| Имя | Описание |
|---------------|----------------------|
| pug | перевод pug в html |
| sass | перевод scss в html |
| rename | переименование файлов |
| babel | перевод ES5 в ES6 |
| concat | конкатинация файлов |
| uglify | минификация кода |
| sourcemaps | создание sourcemaps |
| del | удаление папок |
| autoprefixer | автопрефиксер |
| browserSync | перезагрузка браузера |
| imagemin | оптимизация изображений |
| pngquant | оптимизация изображений |
| cache | очистка кэша |
| svgSprite | создание спрайтов |
| svgmin | оптимизация спрайтов |
| cheerio | удаление тегов из спрайтов |
| replace | замена символов |