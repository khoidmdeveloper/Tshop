package com.project.tshop.config;

import com.project.tshop.entity.Category;
import com.project.tshop.entity.Product;
import com.project.tshop.entity.ProductImage;
import com.project.tshop.entity.User;
import com.project.tshop.repository.CategoryRepository;
import com.project.tshop.repository.ProductImageRepository;
import com.project.tshop.repository.ProductRepository;
import com.project.tshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final List<CategorySeed> CATEGORY_SEEDS = List.of(
            new CategorySeed("cpu", "Processors", "cpu"),
            new CategorySeed("gpu", "Graphics Cards", "gpu"),
            new CategorySeed("motherboard", "Motherboards", "motherboard"),
            new CategorySeed("ram", "RAM", "ram"),
            new CategorySeed("storage", "Storage", "storage"),
            new CategorySeed("psu", "Power Supplies", "psu"),
            new CategorySeed("case", "Cases", "case"),
            new CategorySeed("cooler", "Cooling", "cooler")
    );

    private static final List<ProductSeed> PRODUCT_SEEDS = List.of(

            product("cpu", "Intel Core i9-14900KS", "intel-core-i9-14900ks", "699.00", 15,
                    "Flagship Intel desktop CPU for gaming and creator workloads",
                    "https://product.hstatic.net/200000722513/product/23-057-univ-k-n13840_158d9e9c698e42d6b620914f6c50a17a_master.png",
                    "https://product.hstatic.net/200000722513/product/23-057-univ-k-n13840_158d9e9c698e42d6b620914f6c50a17a_master.png"),

            product("cpu", "AMD Ryzen 9 7950X", "amd-ryzen-9-7950x", "549.00", 22,
                    "High-end AM5 processor with strong multi-thread performance",
                    "https://bizweb.dktcdn.net/100/410/941/products/ryzen-9-7950x.jpg?v=1678258844063",
                    "https://bizweb.dktcdn.net/100/410/941/products/ryzen-9-7950x.jpg?v=1678258844063"),

            product("gpu", "NVIDIA GeForce RTX 4090", "nvidia-geforce-rtx-4090", "1899.00", 8,
                    "Top-tier 4K and ray tracing GPU for demanding workloads",
                    "https://cdn.tgdd.vn/News/0/tim-hieu-card-do-hoa-cao-cap-rtx-4090-chi-tiet-01-800x450.png",
                    "https://cdn.tgdd.vn/News/0/tim-hieu-card-do-hoa-cao-cap-rtx-4090-chi-tiet-01-800x450.png"),

            product("gpu", "AMD Radeon RX 7900 XT", "amd-radeon-rx-7900-xt", "749.00", 18,
                    "High performance Radeon GPU with strong price to performance",
                    "https://nguyencongpc.vn/media/product/24042-gigabyte-radeon-rx-7900-xt-gaming-oc-20gbvgigabyte-radeon-rx-7900-xt-gaming-oc-20gb.jpg",
                    "https://nguyencongpc.vn/media/product/24042-gigabyte-radeon-rx-7900-xt-gaming-oc-20gbvgigabyte-radeon-rx-7900-xt-gaming-oc-20gb.jpg"),

            product("ram", "Corsair Dominator Titanium DDR5 64GB", "corsair-dominator-titanium-ddr5-64gb", "599.00", 28,
                    "High-speed DDR5 kit designed for enthusiast builds",
                    "https://bizweb.dktcdn.net/thumb/1024x1024/100/329/122/products/ram-pc-corsair-dominator-titanium-64gb-6000mhz-ddr5-2x32gb-cmp64gx5m2b6000c30-03.jpg?v=1723103671203",
                    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Corsair_Dominator_Platinum_RGB.jphttps://bizweb.dktcdn.net/thumb/1024x1024/100/329/122/products/ram-pc-corsair-dominator-titanium-64gb-6000mhz-ddr5-2x32gb-cmp64gx5m2b6000c30-03.jpg?v=1723103671203g"),

            product("storage", "Samsung 990 Pro NVMe SSD 4TB", "samsung-990-pro-nvme-ssd-4tb", "449.00", 31,
                    "High-end PCIe 4.0 NVMe SSD for creators and gamers",
                    "https://bizweb.dktcdn.net/100/329/122/products/ssd-samsung-990-pro-4tb-pcie-gen-4-0-x4-nvme-v-nand-m-2-2280-mz-v9p4t0bw.jpg?v=1715014959657",
                    "https://bizweb.dktcdn.net/100/329/122/products/ssd-samsung-990-pro-4tb-pcie-gen-4-0-x4-nvme-v-nand-m-2-2280-mz-v9p4t0bw.jpg?v=1715014959657"),

            product("psu", "Corsair RM1000e 1000W Gold", "corsair-rm1000e-1000w-gold", "249.00", 25,
                    "Fully modular PSU with 80 Plus Gold efficiency",
                    "https://upload.wikimedia.org/wikipedia/commons/3/3e/Corsair_RM1000x.jpghttps://product.hstatic.net/200000722513/product/thiet_ke_chua_co_ten_a532c354608f43eab3313b54626b3c70_5a71147440ae46bfad22d894f423d857_master.png",
                    "https://product.hstatic.net/200000722513/product/thiet_ke_chua_co_ten_a532c354608f43eab3313b54626b3c70_5a71147440ae46bfad22d894f423d857_master.png"),

            product("case", "Corsair 5000D Airflow TG White", "corsair-5000d-airflow-tg-white", "169.00", 27,
                    "Spacious chassis optimized for cooling performance",
                    "https://product.hstatic.net/200000722513/product/ir-5000d-airflow-tempered-glass-white_d18397e966e241c1a66b9a3168059bd4_95bf176f7a71495f9af630127286036d.png",
                    "https://product.hstatic.net/200000722513/product/ir-5000d-airflow-tempered-glass-white_d18397e966e241c1a66b9a3168059bd4_95bf176f7a71495f9af630127286036d.png"),

            product("cooler", "Noctua NH-D15 chromax.black", "noctua-nh-d15-chromax-black", "119.00", 41,
                    "Premium dual tower air cooler with excellent thermals",
                    "https://nguyencongpc.vn/media/product/15934-51537_tan_nhiet_khi_noctua_nh_d15_chromax_black_2.jpg",
                    "https://nguyencongpc.vn/media/product/15934-51537_tan_nhiet_khi_noctua_nh_d15_chromax_black_2.jpg")
    );

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedDefaultUsers();
        Map<String, Category> categoriesByKey = seedDefaultCategories();
        Map<String, Product> productsBySlug = seedDefaultProducts(categoriesByKey);
        seedDefaultProductImages(productsBySlug);
    }

    private void seedDefaultUsers() {
        seedUser("admin@tshop.local", "Admin@123", "admin", "System Admin", "0900000001");
        seedUser("customer1@tshop.local", "Customer@123", "customer", "Customer One", "0900000002");
        seedUser("customer2@tshop.local", "Customer@123", "customer", "Customer Two", "0900000003");
    }

    private Map<String, Category> seedDefaultCategories() {
        Map<String, Category> categoriesByKey = new HashMap<>();
        for (CategorySeed seed : CATEGORY_SEEDS) {
            Category category = categoryRepository.findFirstBySlug(seed.slug())
                    .orElseGet(() -> categoryRepository.save(new Category(
                            null,
                            seed.name(),
                            seed.slug(),
                            null,
                            new ArrayList<>(),
                            new ArrayList<>()
                    )));
            categoriesByKey.put(seed.key(), category);
        }
        return categoriesByKey;
    }

    private Map<String, Product> seedDefaultProducts(Map<String, Category> categoriesByKey) {
        Map<String, Product> productsBySlug = new HashMap<>();
        for (ProductSeed seed : PRODUCT_SEEDS) {
            Product existing = productRepository.findFirstBySlug(seed.slug()).orElse(null);
            if (existing != null) {
                productRepository.updateThumbnailBySlug(seed.slug(), seed.thumbnail());
                productsBySlug.put(seed.slug(), existing);
                continue;
            }

            Category category = categoriesByKey.get(seed.categoryKey());
            if (category == null) {
                throw new IllegalStateException("Missing category seed for key: " + seed.categoryKey());
            }

            Product product = new Product(
                    null,
                    category,
                    seed.name(),
                    seed.slug(),
                    seed.price(),
                    seed.stockQuantity(),
                    seed.description(),
                    null,
                    seed.thumbnail(),
                    "active",
                    null,
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
            Product saved = productRepository.save(product);
            productsBySlug.put(seed.slug(), saved);
        }
        return productsBySlug;
    }

    private void seedDefaultProductImages(Map<String, Product> productsBySlug) {
        for (ProductSeed seed : PRODUCT_SEEDS) {
            Product product = productsBySlug.get(seed.slug());
            if (product == null) {
                continue;
            }

            for (int i = 0; i < seed.imageUrls().size(); i++) {
                int sortOrder = i + 1;
                String imageUrl = seed.imageUrls().get(i);
                if (productImageRepository.existsByProductAndObjectKey(product, imageUrl)) {
                    continue;
                }

                ProductImage image = new ProductImage(
                        null,
                        product,
                        imageUrl,
                        seed.name() + " image " + sortOrder,
                        sortOrder,
                        null
                );
                productImageRepository.save(image);
            }
        }
    }

    private void seedUser(String email, String rawPassword, String role, String fullName, String phone) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .fullName(fullName)
                .phone(phone)
                .build();

        userRepository.save(user);
    }

    private static ProductSeed product(
            String categoryKey,
            String name,
            String slug,
            String price,
            Integer stockQuantity,
            String description,
            String thumbnail,
            String image1
    ) {
        return new ProductSeed(
                categoryKey,
                name,
                slug,
                new BigDecimal(price),
                stockQuantity,
                description,
                thumbnail,
                List.of(image1)
        );
    }

    private record CategorySeed(String key, String name, String slug) {
    }

    private record ProductSeed(
            String categoryKey,
            String name,
            String slug,
            BigDecimal price,
            Integer stockQuantity,
            String description,
            String thumbnail,
            List<String> imageUrls
    ) {
    }
}
