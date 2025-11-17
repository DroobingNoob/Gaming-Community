import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Crown, Monitor } from 'lucide-react';

interface CategoriesProps {
  onViewAllGames: () => void;
  onViewSubscriptions: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ onViewAllGames, onViewSubscriptions }) => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name:"PS Games",
      icon: <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse PS4, PS5 Games",
      image: "https://i.ibb.co/Fq0ZPxqR/1-20251011-020740-0000-1.jpg",
 
      gameCount: "500+",
      onClick: () => navigate('/games')
    },
    {
      id: 2,
      name: "PC Games",
      icon: <Monitor className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse PC Games",
      image: "https://i.ibb.co/5XDWVjW0/2-20251011-020740-0001.jpg", 
      gameCount: "200+",
      onClick: () => navigate('/pc-games')
    },
    { 
      id: 3,
      name: "Subscriptions",
      icon: <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />,
      description: "Click to Browse Subscriptions",
      image: "https://i.ibb.co/XfMYFMBt/Black-and-White-Modern-Thesis-Defense-Research-Presentation-1024-x-768-px-20251102-033517-0000.jpg", 
      gameCount: "10+",
      onClick: () => navigate('/subscriptions')
    }
  ];

  // return (
  //   <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
  //     <div className="container mx-auto px-3 sm:px-4">
  //       <div className="text-center mb-8 sm:mb-10 md:mb-12">
  //         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
  //           Shop by Category
  //         </h2>
  //         <p className="text-gray-600 text-base sm:text-lg px-4">
  //           Find games for your favorite gaming platform
  //         </p>
  //       </div>

  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
  //         {categories.map((category) => (
  //           <div
  //             key={category.id}
  //             className="group cursor-pointer"
  //             onClick={category.onClick}
  //           > 
  //             <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm hover:from-cyan-50/80 hover:to-orange-50/80 transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-3 shadow-lg hover:shadow-2xl border-2 border-[#7DF9FF]">
  //               {/* Background Image */}
  //               <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
  //                 <img
  //                   src={category.image}
  //                   alt={category.name}
  //                   className="w-full h-full object-cover"
  //                 />
  //               </div>
                
  //               {/* Content */}
  //               <div className="relative p-6 sm:p-8 md:p-12 text-center">
  //                 <div className="text-cyan-500 group-hover:text-orange-500 transition-colors duration-300 mb-4 sm:mb-6 flex justify-center bg-gradient-to-r from-cyan-100 to-blue-100 group-hover:from-orange-100 group-hover:to-red-100 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full items-center mx-auto">
  //                   {category.icon}
  //                 </div>
                  
  //                 <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
  //                   {category.name}
  //                 </h3>
                  
  //                 <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
  //                   {category.description}
  //                 </p>
                  
  //                 <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
  //                   <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
  //                    {category.gameCount}  {category.name !=="Subscriptions" ? "Games" : "Subscriptions"}
  //                   </span>
  //                 </div> 
  //               </div> 

  //               {/* Hover Effect Overlay */}
  //               <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </section>
  // );
   return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Find games for your favorite gaming platform
          </p>
        </div>

        {/* Image Cards Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={category.onClick}
              className=" group relative overflow-hidden rounded-xl sm:rounded-2xl 
    shadow-md hover:shadow-cyan-400/40 border-2 border-transparent 
    hover:border-cyan-400 cursor-pointer 
    transform hover:-translate-y-2 active:scale-95 
    transition-all duration-300 ease-out"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-60 sm:h-72 md:h-80 object-cover 
      transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent 
    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg sm:text-xl font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
  {category.name}
  </div>
              
            </div>
     
  
          ))}
        </div>
      </div>
    </section>
  ); 
};

export default Categories;