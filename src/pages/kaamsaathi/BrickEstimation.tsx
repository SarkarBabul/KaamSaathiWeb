import { Helmet } from "react-helmet-async";
import { Calculator, BrickWall, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BrickEstimation() {
  return (
    <>
      <Helmet>
        <title>Brick Estimation Calculator - KaamSaathi</title>
        <meta
          name="description"
          content="Calculate bricks needed for your construction project with KaamSaathi's free brick estimation tool."
        />
        <link rel="canonical" href="https://kaamsaathi.app/cost-estimation/brick-estimation" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Calculator className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">
              Kaam<span className="text-accent">Saathi</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Brick Estimation Calculator
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Coming soon — calculate the exact number of bricks, mortar, and cost for your construction walls.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <BrickWall className="h-9 w-9 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Under Development
              </h2>
              <p className="text-muted-foreground mb-6">
                We are building a powerful brick estimation tool to help contractors and builders calculate material quantities accurately.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-8">
                <p>• Calculate bricks for any wall size</p>
                <p>• Estimate mortar &amp; cement quantity</p>
                <p>• Get total cost breakdown instantly</p>
              </div>
              <a href="/">
                <Button className="gap-2">
                  Back to Home <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}