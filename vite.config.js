import fs from 'fs';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import pugPlugin from 'vite-plugin-pug';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import createSvgSpritePlugin from 'vite-plugin-svg-spriter';


const SRC_PATH = resolve(__dirname, 'src');
const SVG_FOLDER_PATH = resolve(SRC_PATH, 'assets', 'icons'); // Путь для иконок
const PAGES_FOLDER_PATH = resolve(SRC_PATH, 'pages'); // Путь для страниц
const BUILD_PATH = resolve(__dirname, 'dist'); // Путь для билда
// Чтобы указать путь вне папки проекта (__dirname, '../public/js/front-build');


// Функция для получения всех HTML файлов из папки pages
function getPages() {
    const files = fs.readdirSync(PAGES_FOLDER_PATH);
    const pages = {};

    files.forEach(file => {
        if (file.endsWith('.html')) {
            const name = file.replace('.html', '');
            pages[name] = resolve(PAGES_FOLDER_PATH, file);
        }
    });

    return pages;
}

// JSON данные
const locals = {
    headerData: require('./src/data/header.json'),
};

export default defineConfig({
    plugins: [
        sassGlobImports(), // Глобальный импорт стилей (@import "../../components/**/*.scss";)
        pugPlugin({
            pretty: true, // Опционально, для красивого форматирования HTML в билд
        },
            locals // JSON данные
        ),
        createSvgSpritePlugin({
            svgFolder: SVG_FOLDER_PATH,
            svgSpriteConfig: {
                shape: {
                    transform: ['svgo'],
                },
            },
            transformIndexHtmlTag: {
                injectTo: 'body',
            },
        })
    ],
    resolve: {
        alias: {
            '@/': '/src/',
        },
    },
    build: {
        outDir: BUILD_PATH,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'), // Точка входа
                ...getPages(), // Добавляем страницы
            },
            output: {
                inlineDynamicImports: false, // Для навигации в локальном проекте (multi-pages)
                // Билд assets в разные папки
                assetFileNames: (assetInfo) => {
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                        return 'assets/fonts/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            }
        },
    },
});
