# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.12.0](https://github.com/mapequation/alluvial-generator/compare/v1.11.0...v1.12.0) (2022-06-10)


### Features

* Color nodes by highlight color ([8299dfd](https://github.com/mapequation/alluvial-generator/commit/8299dfdb7d941344b137c3ec6c341112ac465bb2))


### Bug Fixes

* Check if state id is null to avoid duplicated node name react keys ([04bd150](https://github.com/mapequation/alluvial-generator/commit/04bd150e0c70920a8c14f70ded22f16a34780bf6))
* Color expanded multilayer networks by id using aggregated module flows ([465b9fe](https://github.com/mapequation/alluvial-generator/commit/465b9fe2efaacafc10d9359858466603f7288a9a))
* Incorrect network levels statistics ([ab5cd3b](https://github.com/mapequation/alluvial-generator/commit/ab5cd3b5770acf3fae9ea7cb530fccc7aa3d23ae))
* Multiline largest node names for state networks ([591b696](https://github.com/mapequation/alluvial-generator/commit/591b69666914a69134c664a56a51552a2c6d135f))
* Return default highlight index for default color ([2755ea9](https://github.com/mapequation/alluvial-generator/commit/2755ea9d073c43e7ecbf8ac8e0c0e7f3db378783))

## [1.11.0](https://github.com/mapequation/alluvial-generator/compare/v1.10.0...v1.11.0) (2022-05-27)


### Features

* Break largest leaf nodes list into multiple lines ([5af333d](https://github.com/mapequation/alluvial-generator/commit/5af333ded133deb9fe08b29b4b41db25f2597864))


### Bug Fixes

* Brighter version color ([b9415aa](https://github.com/mapequation/alluvial-generator/commit/b9415aa69fde424a3f155b9f5e14a8d99a784a8d))
* Show Infomap version ([0431c71](https://github.com/mapequation/alluvial-generator/commit/0431c716fa2f2c2c4a8be113282c28f90aa65030))
* Use horizontal stepper labels ([6056d84](https://github.com/mapequation/alluvial-generator/commit/6056d84126d276514a09a24f0bebc29fbb24afac))

## [1.10.0](https://github.com/mapequation/alluvial-generator/compare/v1.9.1...v1.10.0) (2022-05-16)


### Features

* Adjustable hierarchical module offset and opacity ([f4783f7](https://github.com/mapequation/alluvial-generator/commit/f4783f74952ec9868e01ca81a40da8a78cec2a72))


### Bug Fixes

* Improve tooltip pie chart labels ([b4292aa](https://github.com/mapequation/alluvial-generator/commit/b4292aa64b75b8c3b63b231598ddbd62bce56578))
* Show module level from clu files ([74f0c65](https://github.com/mapequation/alluvial-generator/commit/74f0c6584d8ab6a7c8a104caf4cff2db4da19e1b))

### [1.9.1](https://github.com/mapequation/alluvial-generator/compare/v1.9.0...v1.9.1) (2022-04-25)


### Bug Fixes

* Disable LoadNetworks dialog actions when running Infomap ([71538ca](https://github.com/mapequation/alluvial-generator/commit/71538ca860110174fefaf837bbb2021645799bb6))
* Num trials should be at least 1 ([2802e61](https://github.com/mapequation/alluvial-generator/commit/2802e6173b34a6ac9fe9fb2359e5f2dc945331f2))
* Parse .net files ([8a65ce1](https://github.com/mapequation/alluvial-generator/commit/8a65ce1bed6d3262e0aacc0f9017fee35d57a50b))

## [1.9.0](https://github.com/mapequation/alluvial-generator/compare/v1.8.0...v1.9.0) (2022-04-21)


### Features

* Add more color schemes ([996aa49](https://github.com/mapequation/alluvial-generator/commit/996aa494a475c6ffe8b3ec6829b7bc4626b7915f))
* Paint metadata pdf and box intervals ([4685a07](https://github.com/mapequation/alluvial-generator/commit/4685a07ac8774b5d0b262541660230c95ed3384e))


### Bug Fixes

* Add text shadow to color palette ([e48fcce](https://github.com/mapequation/alluvial-generator/commit/e48fcce971826615a17dc733065cec5521792793))
* Clear saved highlightColors when clearing all colors ([67c00e3](https://github.com/mapequation/alluvial-generator/commit/67c00e3b9873a4858db021b8915b33762c23d93f))
* Don't mutate observable outside action ([414d7ab](https://github.com/mapequation/alluvial-generator/commit/414d7ab835154ac484b32f4de57d82bbeb834c6b))
* Don't render meta collection if metadata is null ([fc0d75d](https://github.com/mapequation/alluvial-generator/commit/fc0d75d43727bb0a67d7cb0cfb3f7b4f535b1f31))
* Map scalar metadata colors to domain of data ([630cc98](https://github.com/mapequation/alluvial-generator/commit/630cc989941625bcb63ba2453eec58e19b82106c))
* Real-valued metadata x-axis should span the data domain ([70527d4](https://github.com/mapequation/alluvial-generator/commit/70527d47eb8532a7aecfa2aac61b30cc7eef2a5e))
* Show metadata colors in sorted order ([0f7dd60](https://github.com/mapequation/alluvial-generator/commit/0f7dd60d1c3d3f9ca399174e4e7aa114a820b7e0))
* Use default highlight color for categorical metadata ([415e8fb](https://github.com/mapequation/alluvial-generator/commit/415e8fb3772aaa1f205bc3b6169b521db16188c9))
* Use metadata bin midpoint when choosing color ([08b66e7](https://github.com/mapequation/alluvial-generator/commit/08b66e7b1b83a0b9a4d859989299aab860d96eba))

## [1.8.0](https://github.com/mapequation/alluvial-generator/compare/v1.7.0...v1.8.0) (2022-04-20)


### Features

* Color nodes by categorical metadata ([6bd7a28](https://github.com/mapequation/alluvial-generator/commit/6bd7a289c2c67fbcf8231245eede37c3dab80c81))
* Color nodes by real-valued metadata ([392cdab](https://github.com/mapequation/alluvial-generator/commit/392cdab6064ec5ad6fb57f79d78de1f31b940bfa))
* Show metadata imported from json files ([841deb8](https://github.com/mapequation/alluvial-generator/commit/841deb89b4777dc0019ada0afdf919c7ce9e7373))

## [1.7.0](https://github.com/mapequation/alluvial-generator/compare/v1.6.0...v1.7.0) (2022-04-13)


### Features

* Add missing matplotlib color schemes ([1e4e7c3](https://github.com/mapequation/alluvial-generator/commit/1e4e7c3f65ddd4bc50161e6376f8344d31327e44))
* Add seaborn color schemes ([9748279](https://github.com/mapequation/alluvial-generator/commit/9748279ef4c81ebfd359c981c24957e424652c61))
* Aggregate state node names when used as module names ([848680a](https://github.com/mapequation/alluvial-generator/commit/848680a934b03106abb5abbb0d96b962f99c7058))
* Group color schemes ([0e2a47b](https://github.com/mapequation/alluvial-generator/commit/0e2a47ba97ff08ee7cfaf31ac9625071aedf2f06))
* Store inter-module links ([b88159e](https://github.com/mapequation/alluvial-generator/commit/b88159e44c72e0cbffdaac2eb4cb0ed41509a85b))


### Bug Fixes

* Change default color scheme ([cec99c4](https://github.com/mapequation/alluvial-generator/commit/cec99c4ade5084be0b5f002a008059eaf4f2b2a4))
* Pass current files to parseAcceptedFiles ([7e20b77](https://github.com/mapequation/alluvial-generator/commit/7e20b77526393a0118712bababae43081d755223))

## [1.6.0](https://github.com/mapequation/alluvial-generator/compare/v1.5.0...v1.6.0) (2022-03-24)


### Features

* Color modules by layer id ([bb0b87a](https://github.com/mapequation/alluvial-generator/commit/bb0b87a61c87d82e853a4539f2641b22524009b8))
* Paint higher-order networks by physical id ([34cd604](https://github.com/mapequation/alluvial-generator/commit/34cd604352623e1735655486e7c8a2d9bb111ebb))

## [1.5.0](https://github.com/mapequation/alluvial-generator/compare/v1.4.0...v1.5.0) (2022-03-08)


### Features

* Add node flow pie chart ([45a7180](https://github.com/mapequation/alluvial-generator/commit/45a7180cb657a3fa6896daeb934a4f6de9e87730))
* Replace LineChart with binned BarChart for performance ([3666ba1](https://github.com/mapequation/alluvial-generator/commit/3666ba1aec6ae313a6df036d6ca13252c268171d))


### Bug Fixes

* Adjust insignificant node brightness ([b50175a](https://github.com/mapequation/alluvial-generator/commit/b50175aaae7dcab62a2c2a819c8b6a889a64ff2b))
* Improve charts and labels ([4ec5cdf](https://github.com/mapequation/alluvial-generator/commit/4ec5cdfbbceaec36ec9e305eaee1a6ffcc9f1191))
* Improve tooltip style ([c34201f](https://github.com/mapequation/alluvial-generator/commit/c34201faa41006d3ff3561d6d8bf4c69f52ec9c2))
* Show tooltip scatter plot when there are less than 50 nodes in the module ([ad81bc8](https://github.com/mapequation/alluvial-generator/commit/ad81bc8aa859657df8e9921cbc4186c23004cb8e))

## [1.4.0](https://github.com/mapequation/alluvial-generator/compare/v1.3.0...v1.4.0) (2022-02-22)


### Features

* Add module tooltip ([4b1b451](https://github.com/mapequation/alluvial-generator/commit/4b1b4513a98cda354181c8c29e60fa8b376a31b5))
* Load all Infomap Online output ([8399483](https://github.com/mapequation/alluvial-generator/commit/83994839bc842c288b6224663fac4552a87cf50b))


### Bug Fixes

* Change menu button text from "Local files" to "Infomap Online" ([fee2178](https://github.com/mapequation/alluvial-generator/commit/fee2178878c9c0b970ae56a4f72595e31e9824dc))
* Disable strict clu/tree header parsing ([7610219](https://github.com/mapequation/alluvial-generator/commit/7610219d0520c3672e07d141891545ee4fb5049a))
* Tweak stepper appearance ([e56e57d](https://github.com/mapequation/alluvial-generator/commit/e56e57d9a5ae316e1cc33172af430174e356f341))
* Use long name in top header logo and title ([40221b0](https://github.com/mapequation/alluvial-generator/commit/40221b00d657b95cf26ac121f38e3b150e113077))

## [1.3.0](https://github.com/mapequation/alluvial-generator/compare/v1.2.0...v1.3.0) (2022-02-08)


### Features

* Add clear option to "local files" menu ([40122c2](https://github.com/mapequation/alluvial-generator/commit/40122c2c140d5afab7c86f4500269dd0cc984cad))
* Load files from Infomap Online ([cf00b2c](https://github.com/mapequation/alluvial-generator/commit/cf00b2cb3021172af3913f473d6347348ebefae2))


### Bug Fixes

* Animate diagram center translation to minimize sudden jumps ([de5dbbc](https://github.com/mapequation/alluvial-generator/commit/de5dbbcedbbc9e9e66e5ce4c4b833e44795c9532))
* Auto-refresh from local storage when the "local files" menu is open ([4858df2](https://github.com/mapequation/alluvial-generator/commit/4858df280c179775333dc5ca842ee0bf4791d698))
* Cleanup SVG export ([5fb1dfa](https://github.com/mapequation/alluvial-generator/commit/5fb1dfaddac7baba9df95fe8796478353d7de913))
* Show hierarchical modules in SVG export ([47b2a07](https://github.com/mapequation/alluvial-generator/commit/47b2a07dacd04bbdb795b65d6eff3878a85dd030))

## [1.2.0](https://github.com/mapequation/alluvial-generator/compare/v1.1.0...v1.2.0) (2022-02-04)


### Features

* Animate presence when files enter and exit the loading screen ([497e3ad](https://github.com/mapequation/alluvial-generator/commit/497e3ad1b1d113a03a52991c0c2073d3bce1d806))
* More animation ([806e756](https://github.com/mapequation/alluvial-generator/commit/806e756739902db6801bf5651a117848da2c6dca))
* Show hierarchical modules ([87cba0e](https://github.com/mapequation/alluvial-generator/commit/87cba0ee3460930c28b8bb29a2a9d02745633db3))


### Bug Fixes

* Decrease example data timeout to 200 ms ([3064400](https://github.com/mapequation/alluvial-generator/commit/3064400ea46a26bf6fdb2e86617103edef28bb21))
* Error handling when loading example data ([7337506](https://github.com/mapequation/alluvial-generator/commit/7337506ddd00520e1036d86d4c034267a991c98f))
* File id confict resolve for json with multiple networks ([f08627f](https://github.com/mapequation/alluvial-generator/commit/f08627f06310885ca2248cc395925f0b3b156525))
* Fix hook deps in LoadNetworks ([2f26c93](https://github.com/mapequation/alluvial-generator/commit/2f26c935adfe736ca8e98d61656be94ed1484fb7))
* Improve module animation ([152f076](https://github.com/mapequation/alluvial-generator/commit/152f076d674d810e67c6ccb52d2068f6f668d776))
* LoadNetworks tweaks ([6a4702b](https://github.com/mapequation/alluvial-generator/commit/6a4702b13c8e9b91264685750ae09f3ea9576d9e))
* Only set identifiers on net files when we have a modular result ([011fb3a](https://github.com/mapequation/alluvial-generator/commit/011fb3a47fbe71766dc6f587c65afdbbc36bfffd))
* Render hierarchical super-modules below all leaf-modules ([2884e77](https://github.com/mapequation/alluvial-generator/commit/2884e777d2ba01d7cb1ebd962d502afb0fcb9ab3))
* Reset state and show correct Infomap errors when Infomap fails ([3a2d1ad](https://github.com/mapequation/alluvial-generator/commit/3a2d1ad0b84748dfd0a64a9ce926b8be6687095e))
* Restore streamline enter/exit transitions ([a212c9b](https://github.com/mapequation/alluvial-generator/commit/a212c9b3e4ebea963e6aa425d8df95f16cc0e1de))
* Rounded Skeleton ([b026283](https://github.com/mapequation/alluvial-generator/commit/b026283cd9be327b01c15371818fce2cb063d1a1))
* Set the selected identifiers when parsing new files ([c85c077](https://github.com/mapequation/alluvial-generator/commit/c85c077b822c4059e11975f48dcd51de0c35a1db))
* Show "Run Infomap" as not completed when loading .net files ([0a4ba61](https://github.com/mapequation/alluvial-generator/commit/0a4ba6197bc1a1029ddd472423d72d4daa7a8a2b))
* Show dropzone state ([e2260fb](https://github.com/mapequation/alluvial-generator/commit/e2260fb97021c236b8f7ba459589c24cfbbd90f4))
* Support stree files ([b63dc72](https://github.com/mapequation/alluvial-generator/commit/b63dc72d907a32da3b5d58b547f49b97357e367e))

## [1.1.0](https://github.com/mapequation/alluvial-generator/compare/v1.0.0...v1.1.0) (2022-02-01)


### Features

* Add node identifier toggle ([3298716](https://github.com/mapequation/alluvial-generator/commit/3298716df778a0ae7bd1f9da457c51efc312c5a7))
* Animate FileBackground modules ([89e2cc5](https://github.com/mapequation/alluvial-generator/commit/89e2cc567c5482bf22bc03cef1d0341e82cd9bba))
* Run directed and two-level Infomap with multiple trials ([8587fe7](https://github.com/mapequation/alluvial-generator/commit/8587fe751da850c5262951d3ff696ffc882cf0bc))
* Run undirected Infomap on net-files ([4572739](https://github.com/mapequation/alluvial-generator/commit/45727395025390b66512a09ed28d83d1420a8ae7))


### Bug Fixes

* Disable node identifier radio group when no files are loaded ([ce861b3](https://github.com/mapequation/alluvial-generator/commit/ce861b3e2cbb6f8d1bb4e43f51bd3f93a563e9f3))
* Remove clear keyboard shortcut on loading screen ([57296f6](https://github.com/mapequation/alluvial-generator/commit/57296f681c69b2d2e476072b22f8ac9c29c4da1f))
* Show loading button when running Infomap ([00ae162](https://github.com/mapequation/alluvial-generator/commit/00ae16270df90313c733eab89e1eb47b10697bcd))
* Show version in sidebar ([cd23acd](https://github.com/mapequation/alluvial-generator/commit/cd23acd1931d8855597fea734578269cb10a48a3))

## [1.0.0](https://github.com/mapequation/alluvial-generator/compare/v0.5.2...v1.0.0) (2022-01-31)


### Features

* Adaptive font-size ([5e9bfd3](https://github.com/mapequation/alluvial-generator/commit/5e9bfd3a8b567034b0bbaea0e75b34daf95a0b50))
* Add c3 color schemes ([cb17250](https://github.com/mapequation/alluvial-generator/commit/cb172505dd4c102c89b079f3e58beb4080e51201))
* Add color mode ([5dd9b3a](https://github.com/mapequation/alluvial-generator/commit/5dd9b3a4b50b4e331cb8684a99b9d94767d66830))
* Add color mode toggle ([0fc9a16](https://github.com/mapequation/alluvial-generator/commit/0fc9a167ec15941ba558c0cf0c92b192d0e49bee))
* Add entropy.ts and math.ts ([1538669](https://github.com/mapequation/alluvial-generator/commit/1538669bd1d4d6005032b8e722b1ebb0f32b8119))
* Add error boundary around SubGraph ([fa1a37c](https://github.com/mapequation/alluvial-generator/commit/fa1a37c4ae488953252a38cfdd75f00a7ce615cc))
* Add expand/contract module buttons ([20761e8](https://github.com/mapequation/alluvial-generator/commit/20761e8b66bc3d09382bea1654777a5b164f5e8b))
* Add progress when loading and parsing files ([6d949cf](https://github.com/mapequation/alluvial-generator/commit/6d949cf6fa8812083aa45cc28f5264fe8a2e4b2b))
* Add raise.ts ([85244f2](https://github.com/mapequation/alluvial-generator/commit/85244f2e2728abe691a98608fbb7f402a66f52ef))
* Add reset modules button ([91ab0b2](https://github.com/mapequation/alluvial-generator/commit/91ab0b27ffc29491cc7d7919f04e9a7b5bdfd1a1))
* Animate logo between header and sidebar ([494d305](https://github.com/mapequation/alluvial-generator/commit/494d30568f38509e0d991d4110986ce2b93bcac3))
* Animate selected module ([2ebeda4](https://github.com/mapequation/alluvial-generator/commit/2ebeda45de68ff22d182a3c68a189a6e46d8de5f))
* LoadNetworks button loading state ([deebcba](https://github.com/mapequation/alluvial-generator/commit/deebcbaf6a5efa56b229bf241e27994732958745))
* Move networks ([2490ade](https://github.com/mapequation/alluvial-generator/commit/2490ade12e199cc1f2939b1bd5481dd15f68d59c))
* Naive color modules by module ids ([2ec13ac](https://github.com/mapequation/alluvial-generator/commit/2ec13ac65b06badb17ab0fb56aef96d27e863708))
* Open Load dialog with "L" ([1f22fbb](https://github.com/mapequation/alluvial-generator/commit/1f22fbb9c78a2d16e902f60722d8f7e37b744f03))
* Read zip-file containing several networks ([3588c6e](https://github.com/mapequation/alluvial-generator/commit/3588c6ea05afde9a7dd07ccf44200114e8258d50))
* Select super/sub-modules on regroup/expand ([da82b7c](https://github.com/mapequation/alluvial-generator/commit/da82b7c6ce52d9f43d8fc5a1bd828993360a8249))
* Select the largest module on diagram creation ([944f048](https://github.com/mapequation/alluvial-generator/commit/944f048fd34d340693b2e6199b1e1041ef3a7238))
* Separate slider for network label font size ([dbde903](https://github.com/mapequation/alluvial-generator/commit/dbde903cfc553b03de2dce9464cdb2300c31c1db))
* Show header on loading screen ([cfe866d](https://github.com/mapequation/alluvial-generator/commit/cfe866d24806b36066a034d361d65a47f86d41b2))
* Show layer id instead of network name on expanded multilayer networks ([c076b51](https://github.com/mapequation/alluvial-generator/commit/c076b51415a65b3167ee678f71360cae5eafe0f6))
* Show modules as background in loading dialog ([ddf80fb](https://github.com/mapequation/alluvial-generator/commit/ddf80fb7bbc91104114cead8bf5609b0c80adc20))
* Show move cursor when shift key is pressed ([a4f71c8](https://github.com/mapequation/alluvial-generator/commit/a4f71c80424ffbafb04aaf1bfad0d955ed81f6ec))
* Show that file is multilayer in loading dialog ([6f352da](https://github.com/mapequation/alluvial-generator/commit/6f352daa3739c82690369365fc1770c047a40a7a))
* Slide in sidebar ([f4f421b](https://github.com/mapequation/alluvial-generator/commit/f4f421b9b2b936b64b304288bc802846716060de))
* Sort modules in expanded multilayer networks before coloring by module id ([e61c2ab](https://github.com/mapequation/alluvial-generator/commit/e61c2ab78dbfe45cea907239c082195b15496713))
* Toggle adaptive font size ([d7068b5](https://github.com/mapequation/alluvial-generator/commit/d7068b5a9116f46b2e348cef3b4005eede3ab02e))
* Use layer names from "layers" in json format if available. ([adab007](https://github.com/mapequation/alluvial-generator/commit/adab007a293a33f080db9f59e1b3c46b2ddc923f))
* Visualiize multilayer networks ([18b6b9a](https://github.com/mapequation/alluvial-generator/commit/18b6b9a3577928cca92030249a948767785e0fac))


### Bug Fixes

* Adaptive font sizes with fractional sizes caused Chrome to stutter when zooming ([baf7786](https://github.com/mapequation/alluvial-generator/commit/baf7786609f90e6c6f77570cbfc2119000529312))
* Adaptive margin in FileBackground for large number of modules ([890c065](https://github.com/mapequation/alluvial-generator/commit/890c065ed90c5b78604e411204d72451db7ada03))
* Add documentation dialog ([b5d8677](https://github.com/mapequation/alluvial-generator/commit/b5d8677b637a936dd768234cfb3bd2bd58ebaa8a))
* Add link id to Streamline to remove animation glitches ([d06829b](https://github.com/mapequation/alluvial-generator/commit/d06829bb979f862b51881e2cf3266ab719845c57))
* Add missing return statement in Module.regroup ([3eecc0e](https://github.com/mapequation/alluvial-generator/commit/3eecc0ea4d0b57fb2441a23b0595f9e66f368fcf))
* Add numLevels and numTopModules to example data ([021f038](https://github.com/mapequation/alluvial-generator/commit/021f038f7bc7ab1aeadd5533f2cb2e0244ea2056))
* Add simple error handling ([69fc224](https://github.com/mapequation/alluvial-generator/commit/69fc2244b96f5dd905f9ebadee03e237ad85f9fd))
* Allow adding the same diagram multiple times ([fb3ff6c](https://github.com/mapequation/alluvial-generator/commit/fb3ff6c2afeaa1c7379c419e268c9f9de66206f1))
* Block keyboard shortcuts in edit mode ([91f62a2](https://github.com/mapequation/alluvial-generator/commit/91f62a2bd3cf6dfb53d5adfe03f3f21653ea5060))
* Center diagram ([d3af8c5](https://github.com/mapequation/alluvial-generator/commit/d3af8c55ec171a8eb1f183df8314f999bea55b43))
* Change contract shortcut to "C" ([9b1f047](https://github.com/mapequation/alluvial-generator/commit/9b1f0478082d3ff1c98dbe9108e7186501715810))
* Change scroll behaviour to "inside" on the "help" modal ([99783a9](https://github.com/mapequation/alluvial-generator/commit/99783a903144ab44d5ddc5cbab92128d8f551679))
* Cleanup aggregation of multilayer network ([13f80b3](https://github.com/mapequation/alluvial-generator/commit/13f80b313acb6f6f16df5c91dbfda77ec1b6a398))
* Decrease default network font size ([eb16555](https://github.com/mapequation/alluvial-generator/commit/eb16555aa19259b80aeaf64e67bcd0357957b747))
* Display better error when dropping unsupported file types ([988966a](https://github.com/mapequation/alluvial-generator/commit/988966aadd3635590c8e5f3843a899a3982b2b82))
* Don't show error area when no errors are present ([56071e0](https://github.com/mapequation/alluvial-generator/commit/56071e070cce75cefb453dcb55a06bfe0e010e30))
* Draw hierarchical sub-graph ([d5ce3dc](https://github.com/mapequation/alluvial-generator/commit/d5ce3dc8b267e1be436da2d36d3543a1be351367))
* Drop-shadow now showing ([bb99bc6](https://github.com/mapequation/alluvial-generator/commit/bb99bc606f30010058f5e327f295f1a4e07086c5))
* Empty HighlightGroups was not removed when calling Node.remove ([7966f7c](https://github.com/mapequation/alluvial-generator/commit/7966f7c7872ded12dcf92ecc5a90c363d7d5a91d))
* Fix module expand/regroup ([7da3dcb](https://github.com/mapequation/alluvial-generator/commit/7da3dcb45615f71696590c672d18adefc00497d3))
* Fix svg text rendering in Safari ([3478951](https://github.com/mapequation/alluvial-generator/commit/3478951c0a69aecace2369e45d8055c8ab7de45c))
* Fix types in useOnClick ([dbe767f](https://github.com/mapequation/alluvial-generator/commit/dbe767f88b6ecdd1e2206f025d60a2f713d237b3))
* Hide file size if zero ([8d16125](https://github.com/mapequation/alluvial-generator/commit/8d1612537605fc5c5c5a576a2aa7890ce2ba9967))
* Increase flow threshold when we expand multilayer networks ([af0d406](https://github.com/mapequation/alluvial-generator/commit/af0d40690773d6c13802ba1b986d1208f5f3e01d))
* Link logo to mapequation.org ([cdd8ab1](https://github.com/mapequation/alluvial-generator/commit/cdd8ab127203f98586bc7a312f21f3dea889d8a4))
* Loading the same network several times work ([1654818](https://github.com/mapequation/alluvial-generator/commit/1654818fb39cde165c4ead28dbb1855f12037003))
* Minify example data ([67f5f2a](https://github.com/mapequation/alluvial-generator/commit/67f5f2a000311b9a2363c3f8ee42c6e6bb931ae9))
* Moving networks that are File instances works ([ec1f042](https://github.com/mapequation/alluvial-generator/commit/ec1f042c56294e300a19f88fdb9884f1e715e75e))
* Never show modules with zero flow ([5414b94](https://github.com/mapequation/alluvial-generator/commit/5414b940125a6a400e907f1073b0699ee645a2fb))
* Only prevent default when arrow keys are pressed ([06610e0](https://github.com/mapequation/alluvial-generator/commit/06610e03bac092a233a16648f81112f54a92a0ad))
* Only set moduleLinks if the modules passed to the Network contains links ([ad36412](https://github.com/mapequation/alluvial-generator/commit/ad36412157945972e4b3d54887d96b412ea2a605))
* Prevent scroll with arrow keys ([4ef8dbc](https://github.com/mapequation/alluvial-generator/commit/4ef8dbca1823b51898b4a9424c18e7d825300a65))
* Remove "any" type from getNodeSize ([fc51ea6](https://github.com/mapequation/alluvial-generator/commit/fc51ea6b181fc337a1cb3f0f8d756c703af5f676))
* Remove bounce to sync animations ([3225483](https://github.com/mapequation/alluvial-generator/commit/32254836e94227031ff16a82c5b54e27e067e656))
* Remove observable from AlluvialNode ([8d74cf7](https://github.com/mapequation/alluvial-generator/commit/8d74cf73c73ca0694dddd687e10bed8c47c35ed5))
* Restore ZoomableSvg as useEffect does not behave as componentDidMount ([d4c44ea](https://github.com/mapequation/alluvial-generator/commit/d4c44ea0166c8f87e80f1c3524b9f7348c4e46b2))
* Reverse changed from wip moving networks ([3276c06](https://github.com/mapequation/alluvial-generator/commit/3276c064859125b6dc4a59dd1ff81226ea110263))
* Set viewbox and viewport on svg elements ([dbf9320](https://github.com/mapequation/alluvial-generator/commit/dbf9320f928ba85d35a7ef8cb0d055c688b37ce9))
* Show correct node id in Module view ([19546dd](https://github.com/mapequation/alluvial-generator/commit/19546dd6ba480b7de33c61dcfb0bb461e1d592d9))
* Show hierarchical sub-modules in graph view ([f9afafe](https://github.com/mapequation/alluvial-generator/commit/f9afafeda00b42f2bab807221096db3c4cae413c))
* Show single layer icon for expanded multilayer networks ([49fa626](https://github.com/mapequation/alluvial-generator/commit/49fa626a52ce655a4b2707c43d66fafc9d005c71))
* Simplify loadExample ([213ae83](https://github.com/mapequation/alluvial-generator/commit/213ae83c0803550c47e3be5a29801d4e078f9f3c))
* Simplify LoadNetworks state ([201ead8](https://github.com/mapequation/alluvial-generator/commit/201ead8fa770df6b42f3a1234001f45df6f34e90))
* Simplify name rendering ([9fdecf3](https://github.com/mapequation/alluvial-generator/commit/9fdecf3b8bf886e8d2193911fcd5f573fcd7ee1b))
* Slider doesn't respect outside value changes ([7620e33](https://github.com/mapequation/alluvial-generator/commit/7620e3378c7d751593e0a732b1b6bf1aba0aade7))
* Small font tweaks and reworded sidebar labels ([861239a](https://github.com/mapequation/alluvial-generator/commit/861239a6a485d8894bd8a65b502a17bd67ff7eb5))
* Svg export ([fbaac53](https://github.com/mapequation/alluvial-generator/commit/fbaac53983fcc820a8ff422bce23b608d27a640c))
* Top streamlines glitching when changing vertical alignment ([3320674](https://github.com/mapequation/alluvial-generator/commit/3320674a216ff9d0d6a26d52081ed266a355d00b))
* Tweak default settings ([27a1b15](https://github.com/mapequation/alluvial-generator/commit/27a1b15b5008ab9314671b5cd88392820b91c699))
* Tweak network delete button ([ef6ff5e](https://github.com/mapequation/alluvial-generator/commit/ef6ff5eb5c556285f4d8787d03ddc347be63889e))
* Tweak sub graph view appearance ([834d348](https://github.com/mapequation/alluvial-generator/commit/834d3481fadff8762a26738fa8478db100ae8c57))
* Tweak svg font sizes and appearance ([d359405](https://github.com/mapequation/alluvial-generator/commit/d359405794ccffc7fdbced2c38bd3f249cb700fe))
* UI improvements ([b164c8a](https://github.com/mapequation/alluvial-generator/commit/b164c8a0205c57bbe4321f46dbba0112199f3ad2))
* Update error handling ([20bc413](https://github.com/mapequation/alluvial-generator/commit/20bc413a4bb01624fd7f671ca75a308b2bf8b55d))
* Use grab cursor on modules and move cursor on background ([f76de99](https://github.com/mapequation/alluvial-generator/commit/f76de99cbc5471b5cbafe3f45f6307cad6240b27))
* Wrap callbacks in useCallback and clear error timeout ([35a4f97](https://github.com/mapequation/alluvial-generator/commit/35a4f974439e5e945ddf189ef44c5ab3063fb626))

### [0.5.2](https://github.com/mapequation/alluvial-generator/compare/v0.5.1...v0.5.2) (2021-01-27)


### Features

* Add more colors ([e075c4b](https://github.com/mapequation/alluvial-generator/commit/e075c4bdcd7a18c6405413f397a2c0ca2c15aae3))
* Allow variable size color schemes ([ff9f3d0](https://github.com/mapequation/alluvial-generator/commit/ff9f3d08a504a279a9e692ef90632d915194faa1))


### Bug Fixes

* Auto paint module ids paints in all networks ([d99f2da](https://github.com/mapequation/alluvial-generator/commit/d99f2daa5a408c118e90e297f2edf95604b55cb7))

### [0.5.1](https://github.com/mapequation/alluvial-generator/compare/v0.5.0...v0.5.1) (2020-02-05)


### Features

* Support inter-layer change in ftree files ([ff56555](https://github.com/mapequation/alluvial-generator/commit/ff5655515f1f3d9bde09ba33614f18893a6c201c))


### Bug Fixes

* Alert user if they somehow load an unsupported file type ([3440681](https://github.com/mapequation/alluvial-generator/commit/344068179a096f7ce6587fbabef3b27c0d453ebe))

## [0.5.0](https://github.com/mapequation/alluvial-generator/compare/v0.4.6...v0.5.0) (2020-01-31)


### Features

* Support inter-layer change in single multilayer networks ([780f062](https://github.com/mapequation/alluvial-generator/commit/780f062980b18ec643e6efb82cffbbe4b1040d2d))


### Bug Fixes

* Normalize flow by the max flow in all networks ([4ea0350](https://github.com/mapequation/alluvial-generator/commit/4ea0350c5fb8531735c6537a6c0f7e84065e3d10))

### [0.4.6](https://github.com/mapequation/alluvial-generator/compare/v0.4.5...v0.4.6) (2020-01-30)


### Features

* Support auto painting all networks by module ids ([065aa7d](https://github.com/mapequation/alluvial-generator/commit/065aa7d9f4782c4b829b059fb3ea3a7eaf2677f0))

### [0.4.5](https://github.com/mapequation/alluvial-generator/compare/v0.4.4...v0.4.5) (2020-01-30)


### Features

* Paint modules with matching module ids in all networks ([0c6d236](https://github.com/mapequation/alluvial-generator/commit/0c6d2365a1c4a736527e334b3ff07be42772b49d))

### [0.4.4](https://github.com/mapequation/alluvial-generator/compare/v0.4.3...v0.4.4) (2020-01-15)


### Features

* Display highlighted streamlines on top ([0e42d28](https://github.com/mapequation/alluvial-generator/commit/0e42d287c7fb3bff166313214fcd9672bdcf4fba))


### Bug Fixes

* Add core-js for supporting older browsers ([ae9c4db](https://github.com/mapequation/alluvial-generator/commit/ae9c4db7a0da412de21b0483f3a35aa9d09559de))

### [0.4.3](https://github.com/mapequation/alluvial-generator/compare/v0.4.2...v0.4.3) (2020-01-07)


### Features

* Simple way to highlight individual nodes ([56e4778](https://github.com/mapequation/alluvial-generator/commit/56e47782d65c2d495adb0e30cb14ea1c4eba2d3b))


### Bug Fixes

* Selected module info table inputs should never be null. ([12c13ab](https://github.com/mapequation/alluvial-generator/commit/12c13ab4b1dd367cbb4014a3f5264173fe5d3179))

### [0.4.2](https://github.com/mapequation/alluvial-generator/compare/v0.4.1...v0.4.2) (2019-12-27)


### Bug Fixes

* Removed extra characters for target StreamlineNode in createId ([203cda5](https://github.com/mapequation/alluvial-generator/commit/203cda558c25a5409300f6d83115d4401ab4728f))
* Sort streamlines as long as the opposite module is above threshold ([3af1ccd](https://github.com/mapequation/alluvial-generator/commit/3af1ccd314d5629b56d33ad85aaca9140f4de1b7))

### [0.4.1](https://github.com/mapequation/alluvial-generator/compare/v0.4.0...v0.4.1) (2019-12-16)


### Bug Fixes

* Mouseover on streamlines should highlight the connected groups ([b5ef52c](https://github.com/mapequation/alluvial-generator/commit/b5ef52cb2a8562ae807f04ae402d4a6c9582ec39))
* Remove LeafNodes from opposite node if the NetworkRoot is removed ([d927619](https://github.com/mapequation/alluvial-generator/commit/d927619f1b054778de493b9e8621da5e50e09df9))

## [0.4.0](https://github.com/mapequation/alluvial-generator/compare/v0.3.3...v0.4.0) (2019-12-04)


### ⚠ BREAKING CHANGES

* Internal API has changed

### Bug Fixes

* Silence proptypes warnings for changelog ([db590e1](https://github.com/mapequation/alluvial-generator/commit/db590e159769614cb66a03b5b46023541194e067))


* API refactor to separate interface vs internal structure ([19874a9](https://github.com/mapequation/alluvial-generator/commit/19874a9b20d109a77caecc10af02de3a87ccf4d6))

### [0.3.3](https://github.com/mapequation/alluvial-generator/compare/v0.3.2...v0.3.3) (2019-12-02)


### Features

* Support significance information in stree files ([5374352](https://github.com/mapequation/alluvial-generator/commit/5374352c283c6ef74bfe96a896531b2deb2e6de7))


### Bug Fixes

* Streamlines could be misaligned for small modules. ([593770d](https://github.com/mapequation/alluvial-generator/commit/593770d2b12ced277d22d6fa16b97c0d66bd6620))

### 0.3.2 (2019-11-24)


### Features

* Include module filters when saving diagram ([175a9d9](https://github.com/mapequation/alluvial-generator/commit/175a9d9ce26a36356d4cfb97c7502e628b7cb337))


### Bug Fixes

* Clear filter when expanding or contracting modules ([789bb14](https://github.com/mapequation/alluvial-generator/commit/789bb14414ece974f30b6fa2beb1bb67b378918f))
