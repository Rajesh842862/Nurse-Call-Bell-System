import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Autoplay, Navigation, Pagination } from "swiper/modules";

const Slider = () => {
	return (
		<div className="h-screen   overflow-hidden  flex justify-center items-center ">
			<Swiper
				spaceBetween={0}
				loop={true}
				centeredSlides={true}
				autoplay={{
					delay: 2500,
					disableOnInteraction: false,
				}}
				pagination={{
					clickable: true,
					type: "bullets",
				}}
				navigation={false}
				modules={[Autoplay, Pagination, Navigation]}
				className="mySwiper w-full h-full    overflow-hidden">
				<SwiperSlide>
					<div className=" w-full h-full  aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover"
							src="https://nurse.ancorathemes.com/wp-content/uploads/2025/10/custom-img-34.jpg"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover "
							src="https://nurse.ancorathemes.com/wp-content/uploads/2025/10/background-08.jpg"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover"
							src="https://img.freepik.com/free-photo/confident-female-doctor-with-reports-clipboard-standing-against-male-patient-hospital_662251-3027.jpg?t=st=1774346127~exp=1774349727~hmac=48fdc5d8232ebe686413c26e4e03f5b6af4fc10a00f85c8ee126b813d4dc016a&w=700&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover"
							src="https://img.freepik.com/premium-photo/smiling-female-caregiver-helping-senior-woman-walking-with-walker-assistance-rehabilitation-health-concept_35674-24449.jpg?ga=GA1.1.1857161212.1774346041&semt=ais_hybrid&w=740&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover "
							src="https://img.freepik.com/free-photo/nurse-checking-pulse-female-patient-s-wrist_23-2147861479.jpg?ga=GA1.1.1857161212.1774346041&semt=ais_hybrid&w=720&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover "
							src="https://img.freepik.com/premium-photo/young-indian-nurse-smiling-standing-front-medical-equipment_299154-5483.jpg?ga=GA1.1.1857161212.1774346041&semt=ais_hybrid&w=740&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover "
							src="https://img.freepik.com/premium-photo/woman-with-stethoscope-around-her-neck-is-smiling-with-elderly-woman_1116403-6188.jpg?ga=GA1.1.1857161212.1774346041&semt=ais_hybrid&w=740&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className=" w-full h-full aspect-square  overflow-hidden">
						<img
							className="w-full rounded-lg h-full p-1 object-cover "
							src="https://img.freepik.com/premium-photo/man-blue-scrubs-stands-hospital-room_862335-426.jpg?ga=GA1.1.1857161212.1774346041&semt=ais_hybrid&w=740&q=100"
							alt="image"
						/>
					</div>
				</SwiperSlide>
			</Swiper>
		</div>
	);
};

export default Slider;
