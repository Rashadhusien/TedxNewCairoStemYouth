import { Card } from "@/components/ui/card"



function SponsorsCard() {
  return      <Card
       
              className="group relative h-[110px] flex items-center justify-center border border-primary/20 bg-primary/4 hover:border-primary/55 hover:bg-primary/8 hover:shadow-[0_0_24px_rgba(230,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-center">
                <div className="w-11 h-11 rounded-full border border-primary/20 bg-primary/8 group-hover:bg-primary/15 group-hover:border-primary/55 flex items-center justify-center mx-auto mb-2.5 transition-all duration-300">
                  <span className="text-[13px] font-bold text-primary/60 group-hover:text-primary transition-colors duration-300">
                   ddd
                  </span>
                </div>
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/55 group-hover:text-white transition-colors duration-300">
                sadfdsae
                </span>
              </div>
            </Card>
}


export default SponsorsCard