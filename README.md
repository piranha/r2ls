# r2ls

Lists folders and allows to download files on Cloudflare R2. Does not show the
top-level index, so works like a kind of shared-if-you-have-a-link way to share
your storage.

## Usage

- Install `wrangler`: `npm i -g wrangler@latest`
- Change `bucket_name` in `wrangler.toml` to your bucket's name
- Run `CLOUDFLARE_ACCOUNT_ID=<your_account_id> make deploy` to deploy your worker
- (optional) Bind your worker to [custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

You can find your account id in Cloudflare's dashboard (it's the first part of
the URL in `https://dash.cloudflare.com/<abdcef>`).
