Migration from TypeScript to Go

The new Go-based parser is significantly more efficient than the previous TypeScript version. It uses only about 1% CPU and 3–4 GB of RAM, processing a page with a large number of links in approximately 2.3 seconds (compared to 5–7 seconds with the old parser).

In contrast, the old parser consumed 4–7 GB of RAM and 40–90% CPU.
