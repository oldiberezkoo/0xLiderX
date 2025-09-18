package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

const (
	BaseURL        = "https://www.olx.uz/nedvizhimost/kvartiry/tashkent/?currency=UYE"
	SaveDir        = "output"
	MaxRetries     = 2
	MaxPages       = 25
	SaveBatchSize  = 20
	PageTimeout    = 8 * time.Second
)

var (
	allLinks    []string
	linksMutex  sync.Mutex
	blockedOnce sync.Once
)

func log(level, msg string) {
	fmt.Printf("[%s] %s %s\n", time.Now().Format("15:04:05"), level, msg)
}

func SaveToJSON(links []string) error {
	if len(links) == 0 {
		return nil
	}

	if err := os.MkdirAll(SaveDir, os.ModePerm); err != nil {
		return fmt.Errorf("ошибка создания папки: %w", err)
	}
	filePath := filepath.Join(SaveDir, "links.json")

	var existing []string
	if data, err := os.ReadFile(filePath); err == nil {
		json.Unmarshal(data, &existing)
	}

	unique := make(map[string]struct{}, len(existing)+len(links))
	for _, l := range existing {
		unique[l] = struct{}{}
	}

	newCount := 0
	for _, l := range links {
		if _, exists := unique[l]; !exists {
			unique[l] = struct{}{}
			existing = append(existing, l)
			newCount++
		}
	}

	if newCount == 0 {
		return nil
	}

	data, _ := json.Marshal(existing)
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return err
	}

	log("SUCCESS", fmt.Sprintf("Сохранено %d ссылок (+%d новых)", len(existing), newCount))
	return nil
}

func GetMaxPages(ctx context.Context) (int, error) {
	timeoutCtx, cancel := context.WithTimeout(ctx, PageTimeout)
	defer cancel()

	var maxPages int
	err := chromedp.Run(timeoutCtx,
		chromedp.Navigate(BaseURL),
		chromedp.Sleep(2*time.Second),
		chromedp.Evaluate(`
			(() => {
				const selectors = [
					'[data-testid^="pagination-link-"]',
					'.pager a',
					'.pagination a',
					'a[href*="page="]'
				];

				let maxPage = 1;
				for (const selector of selectors) {
					const links = document.querySelectorAll(selector);
					links.forEach(l => {
						const text = l.textContent || l.getAttribute('href') || '';
						const pageMatch = text.match(/(\d+)/g);
						if (pageMatch) {
							const nums = pageMatch.map(n => parseInt(n)).filter(n => n > 0 && n < 1000);
							nums.forEach(n => { if (n > maxPage) maxPage = n; });
						}
					});
				}

				const pageLinks = Array.from(document.querySelectorAll('a[href*="page="]'));
				pageLinks.forEach(link => {
					const match = link.href.match(/page=(\d+)/);
					if (match) {
						const pageNum = parseInt(match[1]);
						if (pageNum > maxPage) maxPage = pageNum;
					}
				});

				return maxPage;
			})()
		`, &maxPages),
	)

	if err != nil || maxPages < 1 {
		log("WARN", "Не удалось определить количество страниц, используем 1")
		return 1, nil
	}

	log("INFO", fmt.Sprintf("Найдено страниц: %d", maxPages))
	return maxPages, nil
}

func ParseListings(ctx context.Context) ([]string, error) {
	timeoutCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()

	var links []string

	err := chromedp.Run(timeoutCtx,
		chromedp.Evaluate(`
			(() => {
				const selectors = [
					'[data-cy="l-card"] a',
					'[data-testid="listing-ad-title"]',
					'.offer-wrapper a',
					'.offer a',
					'a[href*="/obyavlenie/"]',
					'a[href*="/id"]',
					'h3 a',
					'.ads__item a'
				];

				const links = new Set();

				for (const selector of selectors) {
					const elements = document.querySelectorAll(selector);
					elements.forEach(el => {
						const href = el.href || el.getAttribute('href');
						if (href && (href.includes('/obyavlenie/') || href.includes('/id'))) {
							const fullUrl = href.startsWith('http') ? href : 'https://www.olx.uz' + href;
							links.add(fullUrl);
						}
					});
				}

				return Array.from(links);
			})()
		`, &links),
	)

	if err != nil || len(links) == 0 {
		chromedp.Run(timeoutCtx,
			chromedp.Evaluate(`
				(() => {
					const links = new Set();
					const allLinks = document.querySelectorAll('a[href]');
					allLinks.forEach(el => {
						const href = el.href;
						if (href && (href.includes('/obyavlenie/') || href.includes('/id')) &&
							href.includes('olx.uz')) {
							links.add(href);
						}
					});
					return Array.from(links);
				})()
			`, &links),
		)
	}

	return links, nil
}

func NavigateToPage(ctx context.Context, pageNum int) error {
	url := fmt.Sprintf("%s&page=%d", BaseURL, pageNum)

	timeoutCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()

	return chromedp.Run(timeoutCtx,
		chromedp.Navigate(url),
		chromedp.WaitReady("body"),
	)
}

func setupBrowser() (context.Context, context.CancelFunc) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-extensions", true),
		chromedp.Flag("disable-plugins", true),
		chromedp.Flag("disable-images", true),
		chromedp.Flag("disable-javascript", false),
		chromedp.Flag("disable-web-security", true),
		chromedp.Flag("disable-features", "TranslateUI,BlinkGenPropertyTrees,VizDisplayCompositor"),
		chromedp.Flag("disable-ipc-flooding-protection", true),
		chromedp.Flag("disable-renderer-backgrounding", true),
		chromedp.Flag("disable-backgrounding-occluded-windows", true),
		chromedp.Flag("disable-component-extensions-with-background-pages", true),
		chromedp.Flag("memory-pressure-off", true),
		chromedp.Flag("max_old_space_size", "4096"),
		chromedp.Flag("aggressive-cache-discard", true),
		chromedp.Flag("enable-fast-unload", true),
		chromedp.Flag("disable-hang-monitor", true),
		chromedp.Flag("disable-prompt-on-repost", true),
		chromedp.Flag("disable-sync", true),
		chromedp.Flag("disable-background-timer-throttling", true),
		chromedp.Flag("disable-backgrounding-occluded-windows", true),
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
	)

	allocatorCtx, cancelAllocator := chromedp.NewExecAllocator(context.Background(), opts...)
	ctx, cancelCtx := chromedp.NewContext(allocatorCtx)

	setupResourceBlocking(ctx)

	return ctx, func() {
		cancelCtx()
		cancelAllocator()
	}
}

func setupResourceBlocking(ctx context.Context) {
	chromedp.ListenTarget(ctx, func(ev interface{}) {
		switch ev.(type) {
		case *network.EventRequestWillBeSent:
			go func() {
				blockedOnce.Do(func() {
					blockedPatterns := []string{
						"*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.svg", "*.ico",
						"*.css", "*.woff", "*.woff2", "*.ttf",
						"*google-analytics*", "*googletagmanager*", "*facebook*",
						"*doubleclick*", "*googlesyndication*", "*amazon-adsystem*",
						"*yandex*", "*metrics*", "*analytics*",
					}
					chromedp.Run(ctx, network.SetBlockedURLs(blockedPatterns))
				})
			}()
		}
	})
}

func main() {
	start := time.Now()
	log("INFO", "🚀 Запуск быстрого парсера OLX...")

	ctx, cancel := setupBrowser()
	defer cancel()

	chromedp.Run(ctx,
		network.Enable(),
		page.Enable(),
	)

	maxPages, err := GetMaxPages(ctx)
	if err != nil {
		log("ERROR", fmt.Sprintf("Ошибка получения страниц: %v", err))
		maxPages = MaxPages
	}

	if maxPages > MaxPages {
		maxPages = MaxPages
		log("INFO", fmt.Sprintf("Ограничиваем до %d страниц", MaxPages))
	}

	allLinks = make([]string, 0, maxPages*20)

	for pageNum := 1; pageNum <= maxPages; pageNum++ {
		pageStart := time.Now()
		log("INFO", fmt.Sprintf("📄 Страница %d/%d", pageNum, maxPages))

		if pageNum > 1 {
			if err := NavigateToPage(ctx, pageNum); err != nil {
				log("ERROR", fmt.Sprintf("Переход на страницу %d: %v", pageNum, err))
				continue
			}
		}

		links, err := ParseListings(ctx)
		if err != nil {
			log("ERROR", fmt.Sprintf("Парсинг страницы %d: %v", pageNum, err))
			continue
		}

		if len(links) == 0 {
			log("WARN", fmt.Sprintf("Страница %d: найдено 0 ссылок", pageNum))
			continue
		}

		linksMutex.Lock()
		allLinks = append(allLinks, links...)
		currentTotal := len(allLinks)
		linksMutex.Unlock()

		log("INFO", fmt.Sprintf("✅ Страница %d: +%d ссылок (всего: %d) за %v",
			pageNum, len(links), currentTotal, time.Since(pageStart).Round(100*time.Millisecond)))

		if len(allLinks) > 0 && (pageNum%5 == 0 || len(links) >= SaveBatchSize) {
			if err := SaveToJSON(allLinks); err != nil {
				log("ERROR", fmt.Sprintf("Ошибка сохранения: %v", err))
			}
		}
	}

	if len(allLinks) > 0 {
		if err := SaveToJSON(allLinks); err != nil {
			log("ERROR", fmt.Sprintf("Финальное сохранение: %v", err))
		}
	}

	duration := time.Since(start)
	log("SUCCESS", fmt.Sprintf("🎉 Завершено! Собрано %d ссылок за %v (%.1f стр/мин)",
		len(allLinks), duration.Round(time.Second), float64(maxPages)/(duration.Minutes())))
}
