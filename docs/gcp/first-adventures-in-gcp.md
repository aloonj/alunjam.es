---
date: 2026-01-11
---

# First Adventures in GCP

I needed somewhere to run a dockerised web application - a Next.js frontend, NestJS backend, with Postgres and Redis for data storage. After years of working with various hosting options, I decided to properly explore Google Cloud Platform and see what the ecosystem offered for a scalable containerised stack.

## The Stack

The application is a fairly standard modern setup:

- Next.js frontend (dockerised)
- NestJS backend API (dockerised)
- PostgreSQL database
- Redis for caching/sessions

The goal was to run this with room to scale, without overpaying during the early low-traffic phase.

## Service Choices

GCP's service catalogue is vast. After evaluating options, I landed on:

**Cloud Run** for the containerised apps. It handles Docker containers natively, scales automatically, and you only pay for what you use. The deployment experience is straightforward - push a container, it runs.

**Compute Engine** for Postgres and Redis. This wasn't my first instinct, but the economics made sense. More on this below.

**Future plans**: CloudSQL for managed Postgres and Memorystore for managed Redis, when scale demands it.

## Cloud Run: The Cold Start Trade-off

Cloud Run's scaling model has real cost implications that aren't immediately obvious.

Setting minimum instances to zero means no charges when idle - attractive for a low-traffic app. But there's a catch: cold starts. When the first request hits after a period of inactivity, there's a noticeable pause while an instance spins up. For static frontend assets this is tolerable, but API requests suffered. Users would see loading delays that felt sluggish.

The fix was setting the API service to a minimum of one instance. This keeps at least one container warm and ready to respond immediately. The trade-off is a small fixed daily cost for that always-on instance, but the user experience improvement justified it.

The frontend stays at min zero - cold starts matter less there, and the cost savings add up.

One gotcha: Cloud Run services are restricted by default. For a public-facing application, you need to explicitly configure the IAM to allow unauthenticated access. It's a sensible default, but easy to miss when you're wondering why your app returns 403s.

## Why Self-Managed Databases (For Now)

CloudSQL and Memorystore are the managed options for Postgres and Redis respectively. They handle backups, patching, failover - all the operational overhead. But they don't scale to zero.

For a low-traffic application, the minimum instance costs add a significant fixed monthly expense. A modest GCE virtual machine running both Postgres and Redis costs substantially less than the managed equivalents with comparable specs.

The calculation changes at scale. When traffic grows and uptime becomes critical, the operational overhead of managing your own database instances starts outweighing the cost savings. At that point, migrating to managed services makes sense.

But with experience managing databases and some automation in place, self-managed isn't the burden it might seem. Ansible handles the provisioning and configuration, making the setup reproducible and the ongoing maintenance minimal.

## Infrastructure as Code with Terraform

Everything is defined in Terraform. The GCP provider is straightforward to work with - once you understand Terraform's concepts, the GCP-specific resources follow logically.

One capability I appreciated: Terraform can provision the software inside GCE VMs, not just create the instances. This means the entire stack - infrastructure and application dependencies - is defined in code and reproducible.

This approach also provides an exit strategy. With infrastructure abstracted through Terraform, migrating to another cloud provider becomes feasible. You're not locked into GCP's specific tooling and workflows.

## The gcloud CLI and IAP Tunneling

Google's `gcloud` command-line tool proved useful for day-to-day operations. One feature that stood out was Identity-Aware Proxy (IAP) tunneling.

IAP lets you SSH into VMs without opening SSH ports to the internet. Traffic tunnels through Google's infrastructure, authenticated via your Google account. No firewall rules to manage, no exposed ports to worry about. For accessing the database VMs securely, it's cleaner than the alternatives.

## Cloud Billing: Learn by Doing

Like AWS, GCP bills for a lot of different things. Compute hours, network egress, storage, API calls - the pricing page is extensive. Trying to predict costs upfront requires understanding dozens of variables.

In practice, it's almost easier to run the infrastructure for a while and observe actual costs in the billing dashboard. The granular breakdown shows exactly what's consuming budget. You learn your cost profile empirically rather than theoretically.

The billing section deserves regular attention, especially early on. Unexpected charges are common until you understand how your specific usage patterns translate to costs.

## Lessons Learned

**Start simple, scale later.** Managed services are convenient but expensive at low scale. Self-managed on GCE can be significantly cheaper while you're finding product-market fit.

**Cold starts matter.** Think carefully about which services need to stay warm. The cost of one always-on instance is often worth it for user-facing APIs.

**Abstract your infrastructure.** Using Terraform from day one means you're not locked in. If GCP stops making sense, migration is possible.

**The service catalogue is overwhelming.** GCP has solutions for everything, and it takes time to understand which services fit your use case and budget. Don't try to learn it all upfront - focus on what you need.

**Billing requires attention.** Don't assume costs will be what you expect. Monitor the billing dashboard regularly until you understand your usage patterns.

## Would I Recommend GCP?

For a similar stack - yes. Cloud Run is a solid platform for containerised applications. The tooling is mature, the gcloud CLI is capable, and the integration between services works well.

My main advice: use Terraform or similar infrastructure-as-code tooling from the start. It makes your setup reproducible, documentable, and portable. If you build correctly, you're not married to GCP - you can move to AWS, Azure, or anywhere else that Terraform supports.

The cloud provider matters less than how you structure your infrastructure. Get that right, and you have options.
